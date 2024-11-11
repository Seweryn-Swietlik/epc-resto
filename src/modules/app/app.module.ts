import { ConfigModule, ConfigService } from 'nestjs-config';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { ConfigNames } from 'lib/config';
import { CategoriesModule } from '@categories/categories.module';
import { MealsModule } from '@meals/meals.module';
import { OrdersModule } from '@orders/orders.module';
import { RedisModule } from '@redis/redis.module';
import { WebsocketModule } from '@websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.load(
      resolve(__dirname, '../../lib/config', '**/!(*.d).config.{ts,js}'),
      {
        modifyConfigName: (name) => name.replace('.config', ''),
      },
    ),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: configService.get(ConfigNames.redis),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get(ConfigNames.typeorm),
      inject: [ConfigService],
    }),
    OrdersModule,
    MealsModule,
    CategoriesModule,
    RedisModule,
    WebsocketModule,
  ],
})
export class AppModule {}
