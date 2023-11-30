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

  afterInit(_server: any): any {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket, ..._args): any {
    this.logger.log(`App-Socket Client connected: ${client.id}`);
    this.sockets.push(client);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log(`App-Socket Client disconnected: ${client.id}`);
  }

  public sendDataToSockets(event, data): any {
    this.logger.log(`Sending ${event} event to sockets.`);
    this.sockets.forEach((socket: Socket) => {
      if (socket.connected) {
        this.logger.log('found a connected socket');
        socket.emit(event, data);
      }
    });
  }

  public sendDataToOneSocket(event, data): any {
    this.logger.log(`Sending ${event} event to a single socket.`);
    for (let i = 0; i < this.sockets.length; i++) {
      if (this.sockets[i].connected) {
        this.sockets[i].emit(event, data);
        break;
      }
    }
  }
}
