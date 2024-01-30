/**
 * According to TwitchDevs, the EventSub API is the future of Twitch's pubsub system.
 * Prefer to use this over pubsub if possible.
 */
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import { TwitchService } from './twitch.service';
import { writeLog } from '../utils/logs';
import * as WebSocket from 'ws';

@Injectable()
export class TwitchEventSub {
  private logger: Logger = new Logger(TwitchEventSub.name);
  private eventSubMessageIds: string[] = [];
  private eventSubConnection: WebSocket;

  private currentHypeTrainLevel = 1;

  constructor(
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService
  ) {
    this.eventSubCreateConnection();
  }

  async eventSubCreateConnection(
    wssUrl = CONFIG.get().twitch.eventWebsocketUrl
  ) {
    this.eventSubConnection = new WebSocket(wssUrl);
    this.eventSubConnection.onopen = () => {
      this.logger.log('EventSub connection opened');
    };

    this.eventSubConnection.onerror = (err) => {
      this.logger.error(err);
    };

    this.eventSubConnection.onclose = (data) => {
      this.logger.error('EventSub connection closed');
      this.logger.error(JSON.stringify(data));
      this.eventSubCreateConnection();
    };

    this.eventSubConnection.onmessage = this.eventSubMessageHandler.bind(this);
  }

  async eventSubMessageHandler(data: { data: string }) {
    const parsedData = JSON.parse(data.data);
    const messageId = parsedData.metadata.message_id;
    if (this.eventSubMessageIds.includes(messageId)) {
      return;
    } else {
      this.eventSubMessageIds.push(messageId);
    }

    const messageType = parsedData.metadata.message_type;

    if (messageType === 'session_welcome') {
      await this.deleteExistingSubscriptions();
      await this.subscribeToEvents(parsedData.payload.session.id);
    }

    if (messageType === 'session_reconnect') {
      this.eventSubCreateConnection(parsedData.payload.session.reconnect_url);
      return;
    }

    if (messageType === 'revocation') {
      this.eventSubConnection.close();
      this.eventSubCreateConnection(parsedData.payload.session.reconnect_url);
    }

    if (messageType === 'notification') {
      void writeLog('events', JSON.stringify(parsedData));
      const subType = parsedData.payload.subscription.type;
      this.logger.log('EventSub notification received: ' + subType);

      try {
        switch (subType) {
          case 'channel.follow':
            await this.onFollow(parsedData);
            break;

          case 'stream.online':
            await this.onStreamOnline(parsedData);
            break;

          case 'channel.hype_train.begin':
            await this.onTrain(parsedData);
            break;

          case 'channel.hype_train.progress':
            await this.onTrainProgress(parsedData);
            break;

          case 'channel.raid':
            await this.onRaid(parsedData);
            break;

          case 'channel.cheer':
            await this.onCheer(parsedData);
            break;

          case 'channel.subscribe':
            // NOTE: This doesn't include resubscribes
            await this.onSubscribe(parsedData);
            break;

          case 'channel.subscription.gift':
            await this.onSubscriptionGift(parsedData);
            break;

          default:
            break;
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  async deleteExistingSubscriptions() {
    // Delete existing subscriptions
    const existingSubs = await this.twitchService.helixApiCall(
      'https://api.twitch.tv/helix/eventsub/subscriptions'
    );
    if (!existingSubs?.data) {
      return;
    }
    for (const sub of existingSubs?.data) {
      await this.twitchService.helixApiCall(
        `https://api.twitch.tv/helix/eventsub/subscriptions?id=${sub.id}`,
        'DELETE'
      );
    }
  }

  async subscribeToEvents(sessionId: string) {
    // https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelfollow
    const events = [
      { eventType: 'channel.follow', version: '2' },
      { eventType: 'stream.online', version: '1' },
      { eventType: 'channel.hype_train.begin', version: '1' },
      { eventType: 'channel.hype_train.progress', version: '1' },
      { eventType: 'channel.raid', version: '1' },
      { eventType: 'channel.cheer', version: '1' },
      { eventType: 'channel.subscribe', version: '1' },
      { eventType: 'channel.subscription.gift', version: '1' }
    ];
    for (const event of events) {
      const condition: {
        broadcaster_user_id: string;
        moderator_user_id?: string;
        to_broadcaster_user_id?: string;
      } = {
        broadcaster_user_id: CONFIG.get().twitch.ownerId
      };
      if (event.version === '2') {
        condition['moderator_user_id'] = CONFIG.get().twitch.ownerId;
      }
      if (event.eventType === 'channel.raid') {
        condition['to_broadcaster_user_id'] = CONFIG.get().twitch.ownerId;
      }
      const res = await this.twitchService.helixApiCall(
        CONFIG.get().twitch.eventSubscriptionUrl,
        'POST',
        {
          type: event.eventType,
          version: event.version,
          condition,
          transport: {
            method: 'websocket',
            session_id: sessionId
          }
        }
      );
      if (res.error) {
        this.logger.error(res);
      } else if (res.data[0]?.status === 'enabled') {
        this.logger.log(`Subscribed to ${event.eventType}`);
      }
    }
  }

  async onCheer(data: {
    payload: {
      event: {
        message: string;
        bits: string;
        user_name: string;
        is_anonymous: boolean;
      };
    };
  }) {
    const obj = {
      message: data.payload.event.message,
      bits: parseInt(data.payload.event.bits) || 0,
      user: data.payload.event.is_anonymous
        ? 'Anonymous'
        : data.payload.event.user_name
    };

    void this.twitchService.ownerRunCommand(`!onbits ${JSON.stringify(obj)}`);
  }

  async onFollow(data: { payload: { event: { user_login: string } } }) {
    void this.twitchService.helixGetTwitchUserInfo(
      data.payload.event.user_login,
      true
    );
  }

  async onSubscribe(data: {
    payload: { event: { user_name: string; is_gift?: string } };
  }) {
    if (data.payload.event.is_gift) {
      // This will be handled by the gift sub event
      return;
    }
    const obj = {
      username: data.payload.event.user_name
    };
    void this.twitchService.ownerRunCommand(`!onsubs ${JSON.stringify(obj)}`);
  }

  async onSubscriptionGift(data: {
    payload: { event: { user_name: string; is_anonymous: string } };
  }) {
    const obj = {
      username: data.payload.event.is_anonymous
        ? 'Anonymous'
        : data.payload.event.user_name,
      isGifter: true
    };
    void this.twitchService.ownerRunCommand(`!onsubs ${JSON.stringify(obj)}`);
  }

  async onRaid(data: {
    payload: { event: { from_broadcaster_user_login: string } };
  }) {
    void this.twitchService.ownerRunCommand(
      `!onraids ${data.payload.event.from_broadcaster_user_login}`
    );
    void this.twitchService.ownerRunCommand(
      `!so ${data.payload.event.from_broadcaster_user_login}`
    );
  }

  async onTrain(_data: unknown) {
    this.currentHypeTrainLevel = 1;
    this.twitchService.botSpeak(
      `Hype train level 1! Come on the train, choo choo ride it!!`
    );
    void this.twitchService.ownerRunCommand('!train');
  }

  async onTrainProgress(data: { payload: { event: { level: number } } }) {
    const level = data.payload.event.level;
    if (level > this.currentHypeTrainLevel) {
      this.currentHypeTrainLevel = level;
      this.twitchService.botSpeak(`Hype train level ${level}! LET'S GOOOOOOO!`);
      void this.twitchService.ownerRunCommand('!train');
    }
  }

  async onStreamOnline(_data: unknown) {
    this.logger.log('Stream is online!');
  }
}
