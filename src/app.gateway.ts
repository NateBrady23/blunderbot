import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CONFIG } from './config/config.service';

@WebSocketGateway(CONFIG.get().wsPort, {
  namespace: 'app-socket',
  transports: ['polling'],
  cors: { origin: '*', methods: '*' }
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger(AppGateway.name);

  private sockets: Socket[] = [];
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
    this.sockets.forEach((socket) => {
      if (socket.connected) {
        this.logger.log('found a connected socket');
        socket.emit(event, data);
      }
    });
  }
}
