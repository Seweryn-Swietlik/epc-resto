import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import currency from 'currency.js';
import { OrderStatus, OrderWay } from 'lib/types';
import {
  CategoryEntity,
  MealEntity,
  OrderEntity,
  OrderItemEntity,
} from 'lib/entities';
import { hasElements } from 'lib/utils';
import { CreateOrderDto, GetOrdersDto, OrderItemDto } from './dto';
import { Meal } from './types';
import { FindOrderItemDao } from './dao';
import { MealsService } from '@meals/meals.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly mealsService: MealsService,
    private readonly db: DataSource,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const { orderItems } = dto;
    const mealsUUIDs = orderItems.map((orderItem) => orderItem.mealUUID);
    const meals = await this.mealsService.findMealsByUUID(mealsUUIDs);

    if (meals.length !== orderItems.length) {
      throw new BadRequestException('Meal not found');
    }

    const totalPrice = this.calculateTotalPrice(meals, orderItems);

    const mealsIdMap = new Map<string, number>();
    meals.forEach((meal) => mealsIdMap.set(meal.mealUUID, meal.mealId));

    const queryRunner = this.db.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const { manager } = queryRunner;

      const order = await manager
        .getRepository(OrderEntity)
        .save({ totalPrice });

      const orderItemsDetails = orderItems.map((orderItem) => ({
        orderId: order.orderId,
        mealId: mealsIdMap.get(orderItem.mealUUID),
        quantity: orderItem.quantity,
      }));

      await manager.getRepository(OrderItemEntity).insert(orderItemsDetails);

      await queryRunner.commitTransaction();

      return { orderUUID: order.orderUUID };
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  updateOrderStatus(orderUUID: string, orderStatus: OrderStatus) {
    return this.orderRepository.update({ orderUUID }, { orderStatus });
  }

  async getOrder(orderUUID: string) {
    const [order, [orderItems]] = await Promise.all([
      this.findOrder(orderUUID),
      this.findOrderItems([orderUUID]),
    ]);

    return { order, orderItems };
  }

  async getOrdersWithItems(dto: GetOrdersDto) {
    const orders = await this.getAllOrders(dto);
    const orderUUIDs = orders.map((order) => order.orderUUID);

    const orderItems = await this.findOrderItems(orderUUIDs);
    const orderItemsMap = new Map<string, FindOrderItemDao[]>();
    orderItems.forEach((item) => {
      const orderUUID = item.orderUUID;

      if (!orderItemsMap.has(orderUUID)) {
        orderItemsMap.set(orderUUID, []);
      }

      orderItemsMap.get(orderUUID)?.push(item);
    });

    return orders.map((order) => {
      const orderItems = orderItemsMap.get(order.orderUUID);

      return { order, orderItems };
    });
  }

  getAllOrders(dto: GetOrdersDto) {
    const { orderStatus, limit, offset } = dto;

    const sql = this.orderRepository
      .createQueryBuilder('O')
      .select('O.orderUUID, O.orderStatus, O.totalPrice');

    if (OrderStatus) {
      sql.where('O.orderStatus = :orderStatus', { orderStatus });
    }

    return sql
      .orderBy('O.createdAt', OrderWay.ASC)
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  private findOrder(orderUUID: string) {
    return this.orderRepository
      .findOneOrFail({
        where: { orderUUID },
        select: ['orderUUID', 'orderStatus', 'totalPrice'],
      })
      .catch(() => {
        throw new BadRequestException('Order not found');
      });
  }

  private findOrderItems(ordersUUIDs: Array<string>) {
    if (!hasElements(ordersUUIDs)) {
      return Promise.resolve([]);
    }

    return this.orderItemRepository
      .createQueryBuilder('OI')
      .select(
        'OI.orderItemUUID, OI.quantity, M.mealName, C.categoryName, O.orderUUID',
      )
      .innerJoin(MealEntity, 'M', 'OI.mealId = M.mealId')
      .innerJoin(CategoryEntity, 'C', 'C.categoryId = M.categoryId')
      .innerJoin(OrderEntity, 'O', 'OI.orderId = O.orderId')
      .where('O.orderUUID IN(:...ordersUUIDs)', { ordersUUIDs })
      .getRawMany<FindOrderItemDao>();
  }

  private calculateTotalPrice(
    meals: Array<Meal>,
    orderItems: Array<OrderItemDto>,
  ) {
    const mealsPriceMap = new Map<string, number>();
    meals.forEach((meal) => mealsPriceMap.set(meal.mealUUID, meal.price));

    return orderItems.reduce((acc, orderItem) => {
      const mealPrice = mealsPriceMap.get(orderItem.mealUUID);

      if (!mealPrice) {
        throw new BadRequestException('Meal not found');
      }

      return currency(acc).add(mealPrice).multiply(orderItem.quantity).value;
    }, 0);
  }
}
