import { Global, Module } from '@nestjs/common';
import { WebsocketGateway } from './order.gateway';

@Global()
@Module({
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
