import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import WebSocket = require('ws');
import { TwitchService } from './twitch.service';

@Injectable()
export class TwitchEventSub {
  private logger: Logger = new Logger(TwitchEventSub.name);
  private eventSubMessageIds: string[] = [];
  private eventSubConnection: WebSocket;

  private opts = {
    identity: {
      username: CONFIG.get().twitch.botUsername,
      password: CONFIG.get().twitch.botPassword
    },
    channels: [CONFIG.get().twitch.channel]
  };

  public client;

  constructor(
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService
  ) {
    this.eventSubCreateConnection();
  }

  eventSubCreateConnection(wssUrl = CONFIG.get().twitch.eventWebsocketUrl) {
    this.eventSubConnection = new WebSocket(wssUrl);
    this.eventSubConnection.onopen = () => {
      this.logger.log('EventSub connection opened');
    };

    this.eventSubConnection.onerror = (err) => {
      this.logger.error(err);
    };

    this.eventSubConnection.onclose = (data) => {
      this.logger.error('EventSub connection closed');
      this.logger.error(data);
      this.eventSubCreateConnection();
    };

    this.eventSubConnection.onmessage = this.eventSubMessageHandler.bind(this);
  }

  async eventSubMessageHandler(data) {
    data = JSON.parse(data.data);
    const messageId = data.metadata.message_id;
    if (this.eventSubMessageIds.includes(messageId)) {
      return;
    } else {
      this.eventSubMessageIds.push(messageId);
    }

    const messageType = data.metadata.message_type;

    if (messageType === 'session_welcome') {
      void this.twitchService.helixApiCall(
        CONFIG.get().twitch.eventSubscriptionUrl,
        'POST',
        {
          type: 'channel.follow',
          version: '2',
          condition: {
            broadcaster_user_id: CONFIG.get().twitch.ownerId,
            moderator_user_id: CONFIG.get().twitch.ownerId
          },
          transport: {
            method: 'websocket',
            session_id: data.payload.session.id
          }
        }
      );
    }

    if (messageType === 'session_reconnect') {
      this.eventSubCreateConnection(data.payload.session.reconnect_url);
      return;
    }

    if (messageType === 'revocation') {
      this.eventSubConnection.close();
      this.eventSubCreateConnection(data.payload.session.reconnect_url);
    }

    if (messageType === 'notification') {
      const subType = data.payload.subscription.type;
      if (subType === 'channel.follow') {
        void this.twitchService.helixGetTwitchUserInfo(
          data.payload.event.user_login,
          true
        );
      }
    }
  }
}
