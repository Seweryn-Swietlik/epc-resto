import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BadRequestException } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrderStatus } from 'lib/types/order';
import { ORDERS_QUEUE_NAME, ORDER_CHANNEL } from './constants';
import { Order } from './types';
import { PubSubService } from '@redis/pub-sub.service';
import { OrdersService } from './orders.service';

@Processor(ORDERS_QUEUE_NAME, { concurrency: 8 })
export class OrdersConsumer extends WorkerHost {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pubSubService: PubSubService<Order>,
  ) {
    super();
  }

  async process(job: Job) {
    const { order } = job.data;
    const { orderUUID } = order;
    const orderStatus = job.name as OrderStatus;

    const allowedStatuses = new Set<OrderStatus>([
      OrderStatus.IN_THE_KITCHEN,
      OrderStatus.IN_DELIVERY,
      OrderStatus.DONE,
    ]);

    if (!allowedStatuses.has(orderStatus)) {
      throw new BadRequestException(`Unknown order status: ${orderStatus}`);
    }

    await this.ordersService.updateOrderStatus(orderUUID, orderStatus);
    this.pubSubService.publishMessage(
      `${ORDER_CHANNEL}-${orderUUID}`,
      job.data,
    );
    this.pubSubService.publishMessage(ORDER_CHANNEL, job.data);
  }
}
