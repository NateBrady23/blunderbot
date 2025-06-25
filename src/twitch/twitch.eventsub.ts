/**
 * According to TwitchDevs, the EventSub API is the future of Twitch's pubsub system.
 * Prefer to use this over pubsub if possible.
 */
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { writeLog } from '../utils/logs';
import { WebSocket } from 'ws';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class TwitchEventSub {
  private readonly logger: Logger = new Logger(TwitchEventSub.name);
  private readonly eventSubMessageIds: string[] = [];
  private eventSubConnection: WebSocket | undefined;

  private currentHypeTrainLevel = 1;

  public constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: WrapperType<TwitchService>
  ) {}

  public init(): void {
    void this.eventSubCreateConnection();
  }

  public async eventSubCreateConnection(
    wssUrl = this.configV2Service.get().twitch?.eventWebsocketUrl || ''
  ): Promise<void> {
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

    this.eventSubConnection.onmessage = (event) => {
      this.eventSubMessageHandler({ data: event.data.toString() });
    };
  }

  public async eventSubMessageHandler(data: { data: string }): Promise<void> {
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
      this.eventSubConnection?.close();
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

          case 'channel.subscription.message':
            await this.onSubscriptionMessage(parsedData.payload.event);
            break;

          case 'channel.ban':
            await this.onBan(parsedData.payload.event);
            break;

          case 'channel.subscription.gift':
            await this.onSubscriptionGift(parsedData.payload.event);
            break;

          case 'channel.chat.message':
            await this.onChatMessage(parsedData.payload.event);
            break;

          case 'channel.channel_points_custom_reward_redemption.add':
            await this.onChannelPointsCustomRewardRedemption(
              parsedData.payload.event
            );
            break;

          default:
            break;
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  public async deleteExistingSubscriptions(): Promise<void> {
    // Delete existing subscriptions
    const existingSubs = (await this.twitchService.helixApiCall(
      'https://api.twitch.tv/helix/eventsub/subscriptions',
      'GET',
      undefined
    )) as { data: { id: string }[] };
    if (!existingSubs?.data) {
      return;
    }
    for (const sub of existingSubs?.data || []) {
      await this.twitchService.helixApiCall(
        `https://api.twitch.tv/helix/eventsub/subscriptions?id=${sub.id}`,
        'DELETE',
        undefined
      );
    }
  }

  public async subscribeToEvents(sessionId: string): Promise<void> {
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
      { eventType: 'channel.subscription.message', version: '1' },
      { eventType: 'channel.chat.message', version: '1' },
      { eventType: 'channel.ban', version: '1' },
      {
        eventType: 'channel.channel_points_custom_reward_redemption.add',
        version: '1'
      }
    ];
    for (const event of events) {
      const condition: {
        broadcaster_user_id: string;
        moderator_user_id?: string;
        to_broadcaster_user_id?: string;
        user_id?: string;
      } = {
        broadcaster_user_id: this.configV2Service.get().twitch?.ownerId || ''
      };
      if (event.version === '2') {
        condition['moderator_user_id'] =
          this.configV2Service.get().twitch?.ownerId || '';
      }
      if (event.eventType === 'channel.raid') {
        condition['to_broadcaster_user_id'] =
          this.configV2Service.get().twitch?.ownerId || '';
      }
      if (event.eventType === 'channel.chat.message') {
        condition['user_id'] = this.configV2Service.get().twitch?.ownerId || '';
      }
      const res = (await this.twitchService.helixApiCall(
        this.configV2Service.get().twitch?.eventSubscriptionUrl || '',
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
      )) as { error: unknown; data: { status: string }[] };
      if (res?.error) {
        this.logger.error(res);
      } else if (res?.data[0]?.status === 'enabled') {
        this.logger.log(`Subscribed to ${event.eventType}`);
      }
    }
  }

  public async onChatMessage(data: OnChatMessageEvent): Promise<void> {
    const obj: OnMessageHandlerInput = {
      message: data.message.text,
      userLogin: data.chatter_user_login,
      displayName: data.chatter_user_name,
      isBot:
        data.chatter_user_login ===
        (this.configV2Service.get().twitch?.botUsername || '').toLowerCase(),
      isMod:
        data.badges.some((badge) => badge.set_id === 'moderator') ||
        data.chatter_user_login ===
          (
            this.configV2Service.get().twitch?.ownerUsername || ''
          ).toLowerCase(),
      isSub: data.badges.some(
        (badge) => badge.set_id === 'subscriber' || badge.set_id === 'founder'
      ),
      isVip: data.badges.some((badge) => badge.set_id === 'vip'),
      isFounder: data.badges.some((badge) => badge.set_id === 'founder'),
      isHypeTrainConductor: data.badges.some(
        (badge) => badge.set_id === 'hype-train'
      ),
      isOwner:
        data.chatter_user_login ===
        (this.configV2Service.get().twitch?.ownerUsername || '').toLowerCase(),
      channelPointsCustomRewardId: data.channel_points_custom_reward_id
    };

    void this.twitchService.onMessageHandler(obj);
  }

  public async onCheer(data: OnCheerEvent): Promise<void> {
    const obj = {
      message: data.message,
      bits: data.bits || 0,
      user: data.is_anonymous ? 'Anonymous' : data.user_name
    };

    void this.twitchService.ownerRunCommand(`!onbits ${JSON.stringify(obj)}`);
  }

  public async onFollow(data: OnFollowEvent): Promise<void> {
    void this.twitchService.helixGetTwitchUserInfo(data.user_login, true);
  }

  public async onSubscribe(data: OnSubscribeEvent): Promise<void> {
    if (data.is_gift) {
      // This will be handled by the gift sub event
      return;
    }
    const obj = {
      username: data.user_name
    };
    void this.twitchService.ownerRunCommand(`!onsubs ${JSON.stringify(obj)}`);
  }

  public async onSubscriptionGift(
    data: OnSubscriptionGiftEvent
  ): Promise<void> {
    const obj = {
      username: data.is_anonymous ? 'Anonymous' : data.user_name,
      isGifter: true
    };
    void this.twitchService.ownerRunCommand(`!onsubs ${JSON.stringify(obj)}`);
  }

  public async onSubscriptionMessage(
    data: OnSubscriptionMessageEvent
  ): Promise<void> {
    const obj = {
      username: data.user_name,
      message: data.message.text
    };
    void this.twitchService.ownerRunCommand(`!onsubs ${JSON.stringify(obj)}`);
  }

  public async onBan(data: OnBanEvent): Promise<void> {
    const obj = {
      username: data.user_name,
      reason: data.reason
    };
    void this.twitchService.ownerRunCommand(`!onbans ${JSON.stringify(obj)}`);
  }

  public async onRaid(data: OnRaidEvent): Promise<void> {
    void this.twitchService.ownerRunCommand(
      `!onraids ${data.from_broadcaster_user_login}`
    );
    void this.twitchService.ownerRunCommand(
      `!so ${data.from_broadcaster_user_login}`
    );
  }

  public async onTrain(_data: OnHypeTrainBeginEvent): Promise<void> {
    this.currentHypeTrainLevel = 1;
    this.twitchService.botSpeak(
      `Hype train level 1! Come on the train, choo choo ride it!!`
    );
    void this.twitchService.ownerRunCommand('!train');
  }

  public async onTrainProgress(data: OnHypeTrainProgressEvent): Promise<void> {
    const level = data.level;
    if (level > this.currentHypeTrainLevel) {
      this.currentHypeTrainLevel = level;
      this.twitchService.botSpeak(`Hype train level ${level}! LET'S GOOOOOOO!`);
      void this.twitchService.ownerRunCommand('!train');
    }
  }

  public async onStreamOnline(_data: OnStreamOnlineEvent): Promise<void> {
    this.logger.log('Stream is online!');
  }

  public async onChannelPointsCustomRewardRedemption(
    data: OnChannelPointsCustomRewardRedemptionEvent
  ): Promise<void> {
    const username = data.user_name;
    const userInput = data.user_input;
    const reward = data.reward;

    this.logger.log(`User ${username} redeemed ${reward.title}`);

    if (
      this.configV2Service.get().twitch?.customRewardCommands?.[reward.title]
    ) {
      for (let command of this.configV2Service.get().twitch
        ?.customRewardCommands?.[reward.title] || []) {
        command = command.replace(/{username}/gi, `${username}`);
        command = command.replace(/{message}/gi, `${userInput}`);
        void this.twitchService.ownerRunCommand(`${command}`, {
          onBehalfOf: username
        });
      }
    }
  }
}
