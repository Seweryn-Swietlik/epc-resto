import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Logger, INestApplication } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigService } from 'nestjs-config';
import { ServerOptions } from 'socket.io';
import { ConfigNames } from 'lib/config';

export class RedisWebSocketAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisWebSocketAdapter.name);
  private readonly publisherClient: ReturnType<typeof createClient>;
  private readonly consumerClient: ReturnType<typeof createClient>;

  constructor(app: INestApplication) {
    super(app);

    const url = app.get(ConfigService).get(ConfigNames.websocket).connectionUrl;

    this.publisherClient = createClient({ url, name: 'websocket-publisher' });
    this.consumerClient = createClient({ url, name: 'websocket-consumer' });

    this.publisherClient.on('error', (error) =>
      this.logger.error('Publisher Client:', error),
    );
    this.consumerClient.on('error', (error) =>
      this.logger.error('Consumer Client:', error),
    );

    Promise.all([this.consumerClient.connect(), this.publisherClient.connect()])
      .then(() => this.logger.log(`Connected to {${url}}`))
      .catch((error) => {
        this.logger.error(error.message, error.stack);
        process.exit(1);
      });
  }

  createIOServer(port: number, options?: ServerOptions) {
    const useRedisFactory = createAdapter(
      this.publisherClient,
      this.consumerClient,
    );

    return super.createIOServer(port, options).adapter(useRedisFactory);
  }
}
