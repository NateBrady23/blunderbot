/**
 * According to TwitchDevs, the EventSub API is the future of Twitch's pubsub system.
 * Prefer to use this over pubsub if possible.
 */
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { writeLog } from '../utils/logs';
import * as WebSocket from 'ws';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class TwitchEventSub {
  private logger: Logger = new Logger(TwitchEventSub.name);
  private eventSubMessageIds: string[] = [];
  private eventSubConnection: WebSocket;

  private currentHypeTrainLevel = 1;

  constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: ConfigV2Service,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService
  ) {}

  init() {
    void this.eventSubCreateConnection();
  }

  async eventSubCreateConnection(
    wssUrl = this.configV2Service.get().twitch.eventWebsocketUrl
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
      void this.eventSubCreateConnection(
        parsedData.payload.session.reconnect_url
      );
      return;
    }

    if (messageType === 'revocation') {
      this.eventSubConnection.close();
      void this.eventSubCreateConnection(
        parsedData.payload.session.reconnect_url
      );
    }

    if (messageType === 'notification') {
      const subType = parsedData.payload.subscription.type;

      if (subType !== 'channel.chat.message') {
        // Log all events except chat messages. They're logged separately.
        void writeLog('events', JSON.stringify(parsedData));
        this.logger.log('EventSub notification received: ' + subType);
      }

      try {
        switch (subType) {
          case 'channel.follow':
            await this.onFollow(parsedData.payload.event);
            break;

          case 'stream.online':
            await this.onStreamOnline(parsedData.payload.event);
            break;

          case 'channel.hype_train.begin':
            await this.onTrain(parsedData.payload.event);
            break;

          case 'channel.hype_train.progress':
            await this.onTrainProgress(parsedData.payload.event);
            break;

          case 'channel.raid':
            await this.onRaid(parsedData.payload.event);
            break;

          case 'channel.cheer':
            await this.onCheer(parsedData.payload.event);
            break;

          case 'channel.subscribe':
            // NOTE: This doesn't include resubscribes
            await this.onSubscribe(parsedData.payload.event);
            break;

          case 'channel.subscription.gift':
            await this.onSubscriptionGift(parsedData.payload.event);
            break;

          case 'channel.chat.message':
            await this.onChatMessage(parsedData.payload.event);
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
    for (const sub of existingSubs?.data || []) {
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
      { eventType: 'channel.subscription.gift', version: '1' },
      { eventType: 'channel.chat.message', version: '1' }
    ];
    for (const event of events) {
      const condition: {
        broadcaster_user_id: string;
        moderator_user_id?: string;
        to_broadcaster_user_id?: string;
        user_id?: string;
      } = {
        broadcaster_user_id: this.configV2Service.get().twitch.ownerId
      };
      if (event.version === '2') {
        condition['moderator_user_id'] =
          this.configV2Service.get().twitch.ownerId;
      }
      if (event.eventType === 'channel.raid') {
        condition['to_broadcaster_user_id'] =
          this.configV2Service.get().twitch.ownerId;
      }
      if (event.eventType === 'channel.chat.message') {
        condition['user_id'] = this.configV2Service.get().twitch.ownerId;
      }
      const res = await this.twitchService.helixApiCall(
        this.configV2Service.get().twitch.eventSubscriptionUrl,
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

  async onChatMessage(data: OnChatMessageEvent) {
    const obj: OnMessageHandlerInput = {
      message: data.message.text,
      userLogin: data.chatter_user_login,
      displayName: data.chatter_user_name,
      isBot:
        data.chatter_user_login ===
        this.configV2Service.get().twitch.botUsername.toLowerCase(),
      isMod: data.badges.some((badge) => badge.set_id === 'moderator'),
      isSub: data.badges.some((badge) => badge.set_id === 'subscriber'),
      isVip: data.badges.some((badge) => badge.set_id === 'vip'),
      isFounder: data.badges.some((badge) => badge.set_id === 'founder'),
      isHypeTrainConductor: data.badges.some(
        (badge) => badge.set_id === 'hype-train'
      ),
      isOwner:
        data.chatter_user_login ===
        this.configV2Service.get().twitch.ownerUsername.toLowerCase(),
      channelPointsCustomRewardId: data.channel_points_custom_reward_id
    };

    void this.twitchService.onMessageHandler(obj);
  }

  async onCheer(data: OnCheerEvent) {
    const obj = {
      message: data.message,
      bits: data.bits || 0,
      user: data.is_anonymous ? 'Anonymous' : data.user_name
    };

    void this.twitchService.ownerRunCommand(`!onbits ${JSON.stringify(obj)}`);
  }

  async onFollow(data: OnFollowEvent) {
    void this.twitchService.helixGetTwitchUserInfo(data.user_login, true);
  }

  async onSubscribe(data: OnSubscribeEvent) {
    if (data.is_gift) {
      // This will be handled by the gift sub event
      return;
    }
    const obj = {
      username: data.user_name
    };
    void this.twitchService.ownerRunCommand(`!onsubs ${JSON.stringify(obj)}`);
  }

  async onSubscriptionGift(data: OnSubscriptionGiftEvent) {
    const obj = {
      username: data.is_anonymous ? 'Anonymous' : data.user_name,
      isGifter: true
    };
    void this.twitchService.ownerRunCommand(`!onsubs ${JSON.stringify(obj)}`);
  }

  async onRaid(data: OnRaidEvent) {
    void this.twitchService.ownerRunCommand(
      `!onraids ${data.from_broadcaster_user_login}`
    );
    void this.twitchService.ownerRunCommand(
      `!so ${data.from_broadcaster_user_login}`
    );
  }

  async onTrain(_data: OnHypeTrainBeginEvent) {
    this.currentHypeTrainLevel = 1;
    this.twitchService.botSpeak(
      `Hype train level 1! Come on the train, choo choo ride it!!`
    );
    void this.twitchService.ownerRunCommand('!train');
  }

  async onTrainProgress(data: OnHypeTrainProgressEvent) {
    const level = data.level;
    if (level > this.currentHypeTrainLevel) {
      this.currentHypeTrainLevel = level;
      this.twitchService.botSpeak(`Hype train level ${level}! LET'S GOOOOOOO!`);
      void this.twitchService.ownerRunCommand('!train');
    }
  }

  async onStreamOnline(_data: OnStreamOnlineEvent) {
    this.logger.log('Stream is online!');
  }
}
