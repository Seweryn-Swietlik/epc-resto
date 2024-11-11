import { DynamicModule, Module } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import { REDIS_CONFIG_OPTIONS } from './constants';
import { PubSubService } from './pub-sub.service';

@Module({})
export class RedisModule {
  static forRootAsync(optionsProvider: {
    imports?: Array<any>;
    inject?: Array<any>;
    useFactory: (...args: Array<any>) => RedisOptions | Promise<RedisOptions>;
  }): DynamicModule {
    return {
      module: RedisModule,
      imports: optionsProvider.imports || [],
      providers: [
        {
          provide: REDIS_CONFIG_OPTIONS,
          useFactory: optionsProvider.useFactory,
          inject: optionsProvider.inject || [],
        },
        PubSubService,
      ],
      exports: [PubSubService],
    };
  }
}
