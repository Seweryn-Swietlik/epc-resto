import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from 'nestjs-config';
import { OrderEntity, OrderItemEntity } from 'lib/entities';
import { ConfigNames } from 'lib/config';
import { ORDERS_QUEUE_NAME } from './constants';
import { OrderGateway } from './order.gateway';
import { OrdersConsumer } from './order.consumer';
import { MealsModule } from '@meals/meals.module';
import { RedisModule } from '@redis/redis.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    BullModule.registerQueue({
      name: ORDERS_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
      },
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get(ConfigNames.redis),
      inject: [ConfigService],
    }),
    MealsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderGateway, OrdersConsumer],
})
export class OrdersModule {}
