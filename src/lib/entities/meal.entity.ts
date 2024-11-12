import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Generated,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { OrderItemEntity } from './order-item.entity';
import { DBTypes } from '../types';

@Entity({ name: 'meal' })
export class MealEntity {
  @PrimaryGeneratedColumn('increment')
  mealId: number;

  @Generated(DBTypes.UUID)
  @Column()
  mealUUID: string;

  @Column()
  mealName: string;

  @Column('decimal')
  price: number;

  @Column(DBTypes.Int)
  categoryId: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => CategoryEntity, (category) => category.meals)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.meal)
  orderItems: Array<OrderItemEntity>;
}
