import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'app-socket', transports: ['polling'] })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger(AppGateway.name);

  private sockets = [];

  afterInit(_server: unknown): undefined {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket) {
    this.logger.log(`App-Socket Client connected: ${client.id}`);
    this.sockets.push(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`App-Socket Client disconnected: ${client.id}`);
  }

  public sendDataToSockets(event: string, data: unknown) {
    this.logger.log(`Sending ${event} event to sockets.`);
    this.sockets.forEach((socket: Socket) => {
      if (socket.connected) {
        this.logger.log('found a connected socket');
        socket.emit(event, data);
      }
    });
  }
}
