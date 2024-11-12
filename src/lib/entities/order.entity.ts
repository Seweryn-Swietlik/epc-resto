import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { DBTypes, OrderStatus } from '../types';

@Entity({ name: 'order' })
export class OrderEntity {
  @PrimaryGeneratedColumn('increment')
  orderId: number;

  @Generated(DBTypes.UUID)
  @Column()
  orderUUID: string;

  @Column({
    type: DBTypes.Enum,
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  orderStatus: OrderStatus;

  @Column({ type: DBTypes.Decimal })
  totalPrice: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  orderItems: Array<OrderItemEntity>;
}
