import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealEntity } from 'lib/entities';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealEntity])],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
