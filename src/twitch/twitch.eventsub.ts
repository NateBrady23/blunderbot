import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import WebSocket = require('ws');
import { TwitchService } from './twitch.service';

@Injectable()
export class TwitchEventSub {
  private logger: Logger = new Logger(TwitchEventSub.name);
  private eventSubMessageIds: string[] = [];
  private eventSubConnection: WebSocket;
  private eventSubPingInterval: NodeJS.Timeout;

  private opts = {
    identity: {
      username: CONFIG.twitch.botUsername,
      password: CONFIG.twitch.botPassword
    },
    channels: [CONFIG.twitch.channel]
  };

  public client;

  constructor(
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService
  ) {
    this.eventSubCreateConnection();
  }

  eventSubCreateConnection(wssUrl = 'wss://eventsub.wss.twitch.tv/ws') {
    this.eventSubConnection = new WebSocket(wssUrl);
    this.eventSubConnection.onopen = () => {
      this.logger.log('EventSub connection opened');

      clearInterval(this.eventSubPingInterval);
      this.eventSubPingInterval = setInterval(
        () => {
          this.eventSubConnection.send(JSON.stringify({ type: 'PING' }));
        },
        4 * 60 * 1000
      );
    };

    this.eventSubConnection.onmessage = this.eventSubMessageHandler.bind(this);
  }

  async eventSubMessageHandler(data) {
    const event = JSON.parse(data.data);
    console.log(event);
    const messageId = event.metadata.message_id;
    if (this.eventSubMessageIds.includes(messageId)) {
      return;
    } else {
      this.eventSubMessageIds.push(messageId);
    }

    const messageType = event.metadata.message_type;

    if (messageType === 'session_reconnect') {
      this.eventSubCreateConnection(event.payload.session.reconnect_url);
      return;
    }

    if (messageType === 'revocation') {
      this.eventSubConnection.close();
      this.eventSubCreateConnection(event.payload.session.reconnect_url);
    }

    if (messageType === 'channel.follow') {
      // TODO
    }
  }
}
