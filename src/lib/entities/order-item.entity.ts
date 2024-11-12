import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Generated,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MealEntity } from './meal.entity';
import { OrderEntity } from './order.entity';
import { DBTypes } from '../types';

@Entity({ name: 'order_item' })
export class OrderItemEntity {
  @PrimaryGeneratedColumn('increment')
  orderItemId: number;

  @Generated(DBTypes.UUID)
  @Column()
  orderItemUUID: string;

  @Column()
  quantity: number;

  @Column(DBTypes.Int)
  mealId: number;

  @Column(DBTypes.Int)
  orderId: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => MealEntity, (meal) => meal.orderItems)
  @JoinColumn({ name: 'mealId' })
  meal: MealEntity;

  @ManyToOne(() => OrderEntity, (order) => order.orderItems)
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;
}
