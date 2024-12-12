import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TwitchService } from './twitch.service';
import { CommandService } from '../command/command.service';

@WebSocketGateway({
  namespace: 'twitch-socket',
  transports: ['polling'],
  cors: {
    origin: '*',
    methods: '*'
  }
})
export class TwitchGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() public wss: Server;

  private logger: Logger = new Logger(TwitchGateway.name);

  private sockets: Socket[] = [];

  public constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: WrapperType<CommandService>,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: WrapperType<TwitchService>
  ) {}

  @SubscribeMessage('botSpeak')
  public handleMessage(_client: Socket, payload: string): void {
    void this.twitchService.botSpeak(payload);
  }

  @SubscribeMessage('updateBoughtSquares')
  public handleUpdateBoughtSquares(
    _client: Socket,
    payload: { [key: string]: string }
  ): void {
    this.commandService.updateBoughtSquares(payload);
  }

  public afterInit(_server: unknown): void {
    this.logger.log('Initialized!');
  }

  public handleConnection(client: Socket): void {
    this.logger.log(`Twitch-Socket Client connected: ${client.id}`);
    this.sockets.push(client);
  }

  public handleDisconnect(client: Socket): void {
    this.logger.log(`Twitch-Socket Client disconnected: ${client.id}`);
  }

  public sendDataToSockets(event: string, data: unknown): void {
    this.logger.log(`Sending ${event} event to sockets.`);
    this.sockets.forEach((socket: Socket) => {
      if (socket.connected) {
        socket.emit(event, data);
      }
    });
  }

  public sendDataToOneSocket(event: string, data: unknown): void {
    this.logger.log(`Sending ${event} event to a single socket.`);

    const firstSocket = this.sockets.find((socket) => socket.connected);
    if (firstSocket) {
      firstSocket.emit(event, data);
    }
  }
}
