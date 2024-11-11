import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ path: '/websocket' })
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private logger = new Logger(WebsocketGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.registerSocket(client);
  }

  handleDisconnect(client: Socket) {
    this.unregisterSocket(client);
  }

  private registerSocket(client: Socket) {
    this.connectedClients.set(client.id, client);

    this.logger.log(`Client registered: ${client.id}`);
  }

  private unregisterSocket(client: Socket) {
    this.connectedClients.delete(client.id);

    this.logger.log(`Client unregistered: ${client.id}`);
  }
}
