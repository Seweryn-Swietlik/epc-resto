import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MealEntity } from './meal.entity';
import { DBTypes } from '../types';

@Entity({ name: 'category' })
export class CategoryEntity {
  @PrimaryGeneratedColumn('increment')
  categoryId!: number;

  @Generated(DBTypes.UUID)
  @Column()
  categoryUUID!: string;

  @Column()
  categoryName!: string;

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @OneToMany(() => MealEntity, (meal) => meal.category)
  meals!: Array<MealEntity>;
}
