import { Body, Controller, Post, Query, Sse } from '@nestjs/common';
import { Observable, interval, map, merge } from 'rxjs';
import { CreateOrderDto, GetOrderDto, GetOrdersDto } from './dto';
import { ORDER_CHANNEL, PING_INTERVAL } from './constants';
import { Order } from './types';
import { CreateOrderResponse } from './response';
import { OrdersService } from './orders.service';
import { PubSubService } from '@redis/pub-sub.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pubSubService: PubSubService<Order>,
  ) {}

  @Post()
  createOrder(@Body() dto: CreateOrderDto): Promise<CreateOrderResponse> {
    return this.ordersService.createOrder(dto);
  }

  @Sse()
  getOrders(@Query() dto: GetOrdersDto): Observable<any> {
    const ping$ = interval(PING_INTERVAL).pipe(map(() => ({ data: 'ping' })));

    const ordersStream$ = new Observable((observer) => {
      this.ordersService.getOrdersWithItems(dto).then((orders) => {
        observer.next({ data: orders });
      });

      this.pubSubService.subscribe(ORDER_CHANNEL, async () => {
        const updatedOrders = await this.ordersService.getOrdersWithItems(dto);
        observer.next({ data: updatedOrders });
      });

      return () => {
        this.pubSubService.unsubscribe(ORDER_CHANNEL);
      };
    });

    return merge(ping$, ordersStream$);
  }

  @Sse('details')
  getOrder(@Query() dto: GetOrderDto) {
    const { orderUUID } = dto;
    const channel = `${ORDER_CHANNEL}-${orderUUID}`;
    const ping$ = interval(PING_INTERVAL).pipe(map(() => ({ data: 'ping' })));

    const orderStream$ = new Observable((observer) => {
      this.ordersService.getOrder(orderUUID).then((order) => {
        observer.next({ data: order });
      });
      this.pubSubService.subscribe(channel, (message) => {
        observer.next({ data: message });
      });

      return () => {
        this.pubSubService.unsubscribe(channel);
      };
    });

    return merge(ping$, orderStream$);
  }
}
