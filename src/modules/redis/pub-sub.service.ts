import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import RedisClient from 'ioredis';
import { ConfigService } from 'nestjs-config';
import { ConfigNames } from 'lib/config';
import { PubSubMessage } from './types';

@Injectable()
export class PubSubService<T> implements OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);
  private publisher: RedisClient;
  private subscriber: RedisClient;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get(ConfigNames.redis);
    const { tls, ...config } = redisConfig;

    const redis = tls ? { tls: config } : config;
    this.publisher = new RedisClient(redis);
    this.subscriber = this.publisher.duplicate();
  }

  async onModuleDestroy() {
    await this.subscriber.unsubscribe();
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  publishMessage(channel: string, message: PubSubMessage<T>) {
    return this.publisher
      .publish(channel, JSON.stringify(message))
      .catch((error) => {
        this.logger.error(error);

        throw error;
      });
  }

  subscribe(channel: string, onMessage: (message: PubSubMessage<T>) => void) {
    this.subscriber.subscribe(channel, (error) => {
      if (error) {
        this.logger.error(error);

        throw error;
      }
    });

    this.subscriber.on('message', (channel, message) => {
      onMessage(JSON.parse(message) as PubSubMessage<T>);
    });
  }

  unsubscribe(channel: string) {
    return this.subscriber.unsubscribe(channel);
  }
}
