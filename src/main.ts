import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import { ConfigService } from 'nestjs-config';
import { ConfigNames } from './lib/config';
import { AppModule } from './modules/app';
import { swaggerSetup } from './swagger-setup';
import { RedisWebSocketAdapter } from '@websocket/adapter/redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const commonConfig = configService.get(ConfigNames.common);
  if (commonConfig.env === 'development') {
    const morgan = await import('morgan');
    app.use(morgan.default('[:date[clf]] :method :url :status'));
  }
  app.enableCors({
    origin: [
      ...commonConfig.frontUrl,
      ...(commonConfig.env === 'development'
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : []),
    ],
    credentials: true,
    exposedHeaders: ['Content-Length', 'Content-Disposition', 'X-File-Name'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );
  app.useWebSocketAdapter(new RedisWebSocketAdapter(app));
  if (commonConfig.env === 'development') {
    swaggerSetup(app);
  }
  await app.listen(commonConfig.port);
}
bootstrap();
