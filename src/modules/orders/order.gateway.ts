import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OrderStatus } from 'lib/types/order';
import { JobData } from './types';
import { ORDERS_QUEUE_NAME } from './constants';
import { OrdersService } from './orders.service';

@WebSocketGateway({ path: '/websocket' })
export class OrderGateway {
  @WebSocketServer() server!: Server;
  private logger = new Logger(OrderGateway.name);

  constructor(
    @InjectQueue(ORDERS_QUEUE_NAME) private readonly ordersQueue: Queue,
    private readonly ordersService: OrdersService,
  ) {}

  @SubscribeMessage(OrderStatus.IN_THE_KITCHEN)
  async handleInTheKitchen(@MessageBody() data: JobData) {
    const { orderUUID } = data;
    const { order, orderItems } = await this.ordersService.getOrder(orderUUID);

    if (order.orderStatus !== OrderStatus.NEW) {
      const errorMessage = 'Invalid order status';

      return this.server.emit('processError', {
        orderUUID,
        message: errorMessage,
      });
    }

    const orderWithNewStatus = {
      ...order,
      orderStatus: OrderStatus.IN_THE_KITCHEN,
    };
    const orderWithItems = { order: orderWithNewStatus, orderItems };

    this.ordersQueue.add(OrderStatus.IN_THE_KITCHEN, orderWithItems, {
      priority: 3,
    });
    this.server.emit('processUpdate', orderWithItems);
  }

  @SubscribeMessage(OrderStatus.IN_DELIVERY)
  async handleInDeliver(@MessageBody() data: JobData) {
    const { orderUUID } = data;
    const { order, orderItems } = await this.ordersService.getOrder(orderUUID);

    if (order.orderStatus !== OrderStatus.IN_THE_KITCHEN) {
      const errorMessage = 'Invalid order status';

      return this.server.emit('processError', {
        orderUUID,
        message: errorMessage,
      });
    }

    const orderWithNewStatus = {
      ...order,
      orderStatus: OrderStatus.IN_DELIVERY,
    };
    const orderWithItems = { order: orderWithNewStatus, orderItems };

    this.ordersQueue.add(OrderStatus.IN_DELIVERY, orderWithItems, {
      priority: 1,
    });
    this.server.emit('processUpdate', orderWithItems);
  }

  @SubscribeMessage(OrderStatus.DONE)
  async handleDoneProcess(@MessageBody() data: JobData) {
    const { orderUUID } = data;
    const { order, orderItems } = await this.ordersService.getOrder(orderUUID);

    if (order.orderStatus !== OrderStatus.IN_DELIVERY) {
      const errorMessage = 'Invalid order status';

      return this.server.emit('processError', {
        orderUUID,
        message: errorMessage,
      });
    }

    const orderWithNewStatus = {
      ...order,
      orderStatus: OrderStatus.DONE,
    };
    const orderWithItems = { order: orderWithNewStatus, orderItems };

    this.ordersQueue.add(OrderStatus.DONE, orderWithItems, { priority: 2 });

    this.server.emit('processUpdate', orderWithItems);
  }
}
