import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { TwitchGateway } from './twitch.gateway';
import { CommandService } from '../command/command.service';
import { writeLog } from '../utils/logs';
import { Platform } from '../enums';
import { ConfigV2Service } from '../configV2/configV2.service';

const newChatters: string[] = [];

// Twitch user map is for determining followers and first time chatters
const twitchUserMap: Record<string, { id: string; isFollower: boolean }> = {};

@Injectable()
export class TwitchService {
  private readonly logger: Logger = new Logger(TwitchService.name);

  public constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: WrapperType<CommandService>,
    @Inject(forwardRef(() => TwitchGateway))
    private readonly twitchGateway: WrapperType<TwitchGateway>,
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>
  ) {
    // TODO: Remove this in favor of proper static methods
    this.botSpeak = this.botSpeak.bind(this);
  }

  public init(): void {
    twitchUserMap[
      this.configV2Service.get().twitch.ownerUsername.toLowerCase()
    ] = {
      id: this.configV2Service.get().twitch.ownerId,
      isFollower: true
    };
    twitchUserMap[this.configV2Service.get().twitch.botUsername.toLowerCase()] =
      {
        id: this.configV2Service.get().twitch.botId,
        isFollower: true
      };
  }

  public async botSpeak(message: string): Promise<void> {
    message = message.replace(/\n/g, ' ');
    if (
      message.length >
      (this.configV2Service.get().twitch.maxMessageLength || 1500)
    ) {
      this.logger.error(message);
      this.logger.error('Message is too long to send. Failing...');
      return;
    }
    // https://github.com/twitchdev/issues/issues/904
    if (message.length > 500) {
      const messages = message.match(/.{1,500}/g);
      if (messages) {
        for (const msg of messages) {
          await this.botSpeak(msg);
        }
      }
      return;
    }
    await this.helixApiCall(
      'https://api.twitch.tv/helix/chat/messages',
      'POST',
      {
        broadcaster_id: this.configV2Service.get().twitch.ownerId,
        sender_id: this.configV2Service.get().twitch.botId,
        message
      },
      false
    );
  }

  public async onMessageHandler(data: OnMessageHandlerInput): Promise<void> {
    let message = data.message;
    void writeLog('chat', `${data.displayName}: ${message}`);
    const regex = new RegExp(
      `^@${this.configV2Service.get().twitch.botUsername}|@${
        this.configV2Service.get().twitch.botUsername
      }$`,
      'i'
    );
    if (regex.test(message)) {
      const replaceRegex = new RegExp(
        `@${this.configV2Service.get().twitch.botUsername} `,
        'i'
      );
      message = '!chat ' + message.replace(replaceRegex, '');
    }
    const context: Context = await this.createContext(message, data);

    const displayName = context.displayName;

    if (!newChatters.includes(displayName)) {
      newChatters.push(displayName);
      // Welcome in new chatters (non-followers)
      if (!context.isFollower) {
        if (
          this.configV2Service.get().twitch.welcome.message &&
          !this.configV2Service
            .get()
            .twitch.welcome.ignoreUsers.includes(displayName.toLowerCase())
        ) {
          const message = this.configV2Service
            .get()
            .twitch.welcome.message.replace(/{user}/gi, `@${displayName}`);
          void this.botSpeak(message);
        }
      } else if (!context.isOwner && !context.isBot) {
        void this.ownerRunCommand(`!buy random ${displayName}`);
      }
    }

    // If the message isn't a !so command, check to see if this user needs
    // to be auto shouted out!
    if (!context.message.startsWith('!so ')) {
      void this.ownerRunCommand(`!autoshoutout ${context.username}`);
    }

    // The message isn't a command or custom reward, so see if it's something we
    // should auto-respond to and then return. Don't auto respond to the bot.
    if (
      !CommandService.isCommandFormat(message) &&
      !data.channelPointsCustomRewardId &&
      !data.userLogin
        .toLowerCase()
        .includes(this.configV2Service.get().twitch.botUsername.toLowerCase())
    ) {
      void this.autoRespond(message);
      return;
    }

    if (!data.channelPointsCustomRewardId) {
      await this.commandService.run(context);
    }
  }

  public async tellAllConnectedClientsToRefresh(): Promise<void> {
    try {
      this.twitchGateway.sendDataToSockets('serverMessage', {
        type: 'REFRESH'
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  public async ownerRunCommand(
    message: string,
    opts: CreateContextOptions = {}
  ): Promise<void> {
    const context: Context = await this.createContext(message, undefined, opts);
    await this.commandService.run(context);
  }

  public async createContext(
    message: string,
    data?: OnMessageHandlerInput,
    opts?: CreateContextOptions
  ): Promise<Context> {
    const context: Partial<Context> = {
      channel: this.configV2Service.get().twitch.ownerUsername,
      message,
      reply: (ctx: Context, message) =>
        void this.botSpeak(`@${ctx.onBehalfOf || ctx.displayName} ${message}`),
      botSpeak: this.botSpeak,
      platform: Platform.Twitch
    };

    if (data) {
      context.isOwner = data.isOwner;
      context.isMod = data.isMod;
      context.isBot = data.isBot;
      context.isSubscriber = data.isSub;
      context.isHypeTrainConductor = data.isHypeTrainConductor;
      context.isFounder = data.isFounder;
      context.isVip = data.isVip;
      context.username = data.userLogin;
      context.displayName = data.displayName;
    } else {
      // If no data, then it's a command being run directly by the owner
      context.isOwnerRun = true;
      context.onBehalfOf = opts.onBehalfOf;
      context.username = this.configV2Service
        .get()
        .twitch.ownerUsername.toLowerCase();
      context.displayName = this.configV2Service.get().twitch.ownerUsername;
      context.isOwner = true;
      context.isMod = true;
      context.isSubscriber = true;
    }

    const user = await this.helixGetTwitchUserInfo(context.displayName);

    if (user) {
      context.isFollower = user.isFollower;
    }

    if (CommandService.isCommandFormat(context.message)) {
      const args = context.message
        .slice(1)
        .split(' ')
        .filter((e) => e !== '');

      if (args.length && args[0].length) {
        const command = args.shift();
        context.body = context.message.replace(`!${command}`, '').trim();
        context.args = args;
        context.command = command.toLowerCase();
      }
    }

    return <Context>context;
  }

  public async autoRespond(message: string): Promise<void> {
    if (!this.configV2Service.get().twitch.autoResponder) return;

    for (const match of this.configV2Service.get().twitch.autoResponder) {
      for (const phrase of match.phrases) {
        const regex = new RegExp(phrase, 'gi');
        if (message.match(regex)) {
          for (const response of match.responses) {
            if (response.startsWith('!')) {
              await this.ownerRunCommand(response);
            } else {
              void this.botSpeak(response);
            }
          }
          return;
        }
      }
    }
  }

  /***
   * TWITCH HELIX API CALLS
   */

  public async helixApiCall(
    url: string,
    method = 'GET',
    body: object = undefined,
    asOwner = true
  ): Promise<unknown> {
    const token = asOwner
      ? this.configV2Service.get().twitch.apiOwnerOauthToken
      : this.configV2Service.get().twitch.apiBotOauthToken;

    const headers = new Headers();
    headers.set('Client-ID', this.configV2Service.get().twitch.apiClientId);
    headers.set('Authorization', `Bearer ${token}`);

    if (body) {
      headers.set('Content-type', 'application/json');
    }

    const request: RequestInit = {
      headers,
      method,
      body: body ? JSON.stringify(body) : undefined
    };

    try {
      const res = await fetch(url, request);
      const json = await res.json();
      if (json?.error) {
        this.logger.error(json);
      }
      return json;
    } catch {
      // no json to parse which is fine
      this.logger.log(`No JSON to parse for ${url}`);
    }
  }

  public async helixGetTwitchUserInfo(
    login: string,
    bustCache = false
  ): Promise<{ id: string; isFollower: boolean } | undefined> {
    login = login.toLowerCase();
    if (bustCache || !twitchUserMap[login]) {
      // Get their twitch id
      const res: { data: [{ id: string }] } = <{ data: [{ id: string }] }>(
        await this.helixApiCall(
          `https://api.twitch.tv/helix/users?login=${login}`,
          'GET'
        )
      );
      const id = res.data[0].id;
      if (!id) return;

      // See if they are a follower
      const res2: { data: unknown[] } = <{ data: unknown[] }>(
        await this.helixApiCall(
          `https://api.twitch.tv/helix/channels/followers?user_id=${id}&broadcaster_id=${
            this.configV2Service.get().twitch.ownerId
          }`,
          'GET'
        )
      );
      const isFollower = !!res2.data[0];

      twitchUserMap[login] = { id, isFollower };
    }
    return twitchUserMap[login];
  }

  public async helixShoutout(login: string): Promise<void> {
    try {
      const user = await this.helixGetTwitchUserInfo(login);
      if (!user) return;
      await this.helixApiCall(
        `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${
          this.configV2Service.get().twitch.ownerId
        }&to_broadcaster_id=${user.id}&moderator_id=${
          this.configV2Service.get().twitch.botId
        }`,
        'POST',
        undefined,
        false
      );
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Error sending shoutout');
    }
  }

  public async updateCustomReward(
    id: string,
    body: { is_enabled?: boolean; cost?: number; prompt?: string }
  ): Promise<unknown> {
    const url = `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${this.configV2Service.get().twitch.ownerId}&id=${id}`;
    return this.helixApiCall(url, 'PATCH', body, true);
  }

  public async createCustomReward(body: {
    title: string;
    cost: number;
  }): Promise<void> {
    const url = `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${this.configV2Service.get().twitch.ownerId}`;
    const res = (await this.helixApiCall(url, 'POST', body, true)) as {
      data: { id: string }[];
    };
    this.logger.log(`Custom reward ID for ${body.title}: ${res.data[0].id}`);
  }

  public async getChatSettings(): Promise<ChatSettings> {
    const url = `https://api.twitch.tv/helix/chat/settings?broadcaster_id=${this.configV2Service.get().twitch.ownerId}`;
    const res = (await this.helixApiCall(url, 'GET', undefined, true)) as {
      data: ChatSettings[];
    };
    return res.data[0];
  }

  public async updateChatSettings(body: UpdateChatSettings): Promise<unknown> {
    const url = `https://api.twitch.tv/helix/chat/settings?broadcaster_id=${this.configV2Service.get().twitch.ownerId}&moderator_id=${this.configV2Service.get().twitch.ownerId}`;
    return this.helixApiCall(url, 'PATCH', body, true);
  }

  public async getPoll(): Promise<PollData> {
    const res = (await this.helixApiCall(
      'https://api.twitch.tv/helix/polls?broadcaster_id=' +
        this.configV2Service.get().twitch.ownerId,
      'GET'
    )) as { data: PollData[] };

    return res.data[0];
  }

  public async createPoll(poll: CreatePoll): Promise<void> {
    await this.helixApiCall('https://api.twitch.tv/helix/polls', 'POST', {
      broadcaster_id: this.configV2Service.get().twitch.ownerId,
      title: poll.title,
      choices: poll.choices,
      duration: poll.duration
    });
  }

  public async endPoll(pollId: string): Promise<void> {
    await this.helixApiCall(
      'https://api.twitch.tv/helix/polls?broadcaster_id=' +
        this.configV2Service.get().twitch.ownerId +
        '&status=TERMINATED' +
        '&id=' +
        pollId,
      'PATCH'
    );
  }
}
