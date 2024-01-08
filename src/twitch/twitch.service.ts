import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import { TwitchGateway } from './twitch.gateway';
import { CommandService } from '../command/command.service';
import { writeLog } from '../utils/logs';
import { Platform } from '../enums';
import { chessSquares } from '../utils/constants';
import { getRandomElement } from '../utils/utils';
import tmi = require('tmi.js');
import { Client } from 'tmi.js';

let shoutoutUsers = CONFIG.autoShoutouts;
const newChatters = [];

// Twitch user map is for determining followers and first time chatters
const twitchUserMap: Record<string, { id: string; isFollower: boolean }> = {};
twitchUserMap[CONFIG.twitch.ownerUsername.toLowerCase()] = {
  id: CONFIG.twitch.ownerId,
  isFollower: true
};
twitchUserMap[CONFIG.twitch.botUsername.toLowerCase()] = {
  id: CONFIG.twitch.botId,
  isFollower: true
};

let boughtSquares = {};

@Injectable()
export class TwitchService {
  private logger: Logger = new Logger(TwitchService.name);

  private opts = {
    identity: {
      username: CONFIG.twitch.botUsername,
      password: CONFIG.twitch.botPassword
    },
    channels: [CONFIG.twitch.channel]
  };

  public client: Client;

  constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: CommandService,
    @Inject(forwardRef(() => TwitchGateway))
    private readonly twitchGateway: TwitchGateway
  ) {
    this.client = new tmi.client(this.opts);

    void this.client.connect();

    this.client.on('connected', this.onConnectedHandler.bind(this));

    // Actions
    this.client.on('cheer', this.onCheerHandler.bind(this));
    this.client.on('message', this.onMessageHandler.bind(this));
    this.client.on('raided', this.onRaidHandler.bind(this));
    this.client.on('subscription', this.onSubscriptionHandler.bind(this));
    this.client.on('resub', this.onResubHandler.bind(this));
    this.client.on('subgift', this.onSubGiftHandler.bind(this));
    this.client.on('submysterygift', this.onSubMysteryGiftHandler.bind(this));
  }

  botSpeak(message: string) {
    void this.client.say(CONFIG.twitch.channel, message);
  }

  checkForShoutout(user: string) {
    user = user.toLowerCase();
    if (shoutoutUsers.includes(user)) {
      void this.ownerRunCommand(`!so ${user}`);
      shoutoutUsers = shoutoutUsers.filter((u) => u !== user);
    }
  }

  onConnectedHandler(address: string, port: number) {
    this.logger.log(`* Connected to ${address}:${port}`);
  }

  updateBoughtSquares(data: unknown) {
    boughtSquares = data;
  }

  async onMessageHandler(_channel: string, tags: ContextTags, message: string) {
    if (message) {
      void writeLog('chat', `${tags['display-name']}: ${message}`);
    }
    const regex = new RegExp(
      `^@${CONFIG.twitch.botUsername}|@${CONFIG.twitch.botUsername}$`,
      'i'
    );
    if (regex.test(message)) {
      const replaceRegex = new RegExp(`@${CONFIG.twitch.botUsername} `, 'i');
      message = '!chat ' + message.replace(replaceRegex, '');
    }
    const context: Context = await this.createContext(message, tags);

    const displayName = context.tags['display-name'];
    if (!newChatters.includes(displayName)) {
      newChatters.push(displayName);
      // Welcome in new chatters (non-followers)
      if (!context.tags.follower) {
        if (
          CONFIG.welcome.enabled &&
          !CONFIG.welcome.ignoreUsers.includes(displayName)
        ) {
          const message = CONFIG.welcome.message.replace(
            /{user}/gi,
            `@${displayName}`
          );
          this.botSpeak(message);
        }
      } else if (!context.tags.owner) {
        const squares = Object.keys(boughtSquares || {});
        const remainingSquares = chessSquares.filter(
          (sq) => !squares.includes(sq)
        );
        if (remainingSquares.length) {
          const square = getRandomElement(remainingSquares);
          void this.ownerRunCommand(`!buy ${square} ${displayName}`);
        }
      }
    }

    // If the message isn't a !so command, check to see if this user needs
    // to be shouted out!
    if (!context.message.startsWith('!so ')) {
      this.checkForShoutout(context.tags.username);
    }

    // The message isn't a command or custom reward, so see if it's something we
    // should auto-respond to and then return. Don't auto respond to the bot.
    if (
      !context.message.startsWith('!') &&
      !tags['custom-reward-id'] &&
      !tags['display-name']
        .toLowerCase()
        .includes(CONFIG.twitch.botUsername.toLowerCase())
    ) {
      void this.autoRespond(message);
      return;
    }

    if (!tags['custom-reward-id']) {
      await this.commandService.run(context);
    }
  }

  async onSubscriptionHandler(
    channel: string,
    username: string,
    method: string,
    message: string,
    userstate: unknown
  ) {
    const toLog = {
      event: 'onSubscriptionHandler',
      channel,
      username,
      method,
      message,
      userstate
    };
    void this.ownerRunCommand(`!subs ${JSON.stringify(toLog)}`);
    void writeLog('events', JSON.stringify(toLog));
  }

  async onResubHandler(
    channel: string,
    username: string,
    months: string,
    message: string,
    userstate: unknown,
    methods: unknown
  ) {
    const toLog = {
      event: 'onResubHandler',
      channel,
      username,
      months,
      methods,
      message,
      userstate
    };
    void this.ownerRunCommand(`!subs ${JSON.stringify(toLog)}`);
    void writeLog('events', JSON.stringify(toLog));
  }

  async onSubGiftHandler(
    channel: string,
    username: string,
    streakMonths: string,
    recipient: string,
    methods: unknown,
    userstate: unknown
  ) {
    const toLog = {
      event: 'onSubGiftHandler',
      channel,
      username,
      streakMonths,
      recipient,
      methods,
      userstate
    };
    void this.ownerRunCommand(`!subs ${JSON.stringify(toLog)}`);
    void writeLog('events', JSON.stringify(toLog));
  }

  async onSubMysteryGiftHandler(
    channel: string,
    username: string,
    streakMonths: string,
    recipient: string,
    methods: unknown,
    userstate: unknown
  ) {
    const toLog = {
      event: 'onSubMysteryGiftHandler',
      channel,
      username,
      streakMonths,
      recipient,
      methods,
      userstate
    };
    void writeLog('events', JSON.stringify(toLog));
  }

  async onRaidHandler(_channel: string, username: string, _viewers: number) {
    void this.ownerRunCommand(`!raids ${username}`);
    void this.ownerRunCommand(`!so ${username}`);
  }

  async onCheerHandler(
    _channel: string,
    userstate: { 'display-name': string; bits: string },
    message: string
  ) {
    const bits = parseInt(userstate.bits) || 0;
    const obj = {
      message,
      bits,
      user: userstate['display-name']
    };

    void this.ownerRunCommand(`!bits ${JSON.stringify(obj)}`);
  }

  async tellAllConnectedClientsToRefresh() {
    try {
      this.twitchGateway.sendDataToSockets('serverMessage', {
        type: 'REFRESH'
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async ownerRunCommand(message: string, opts: CreateContextOptions = {}) {
    const context: Context = await this.createContext(message, undefined, opts);
    await this.commandService.run(context);
  }

  async createContext(
    message: string,
    tags?: ContextTags,
    opts?: CreateContextOptions
  ): Promise<Context> {
    const context: Context = {
      client: this.client,
      channel: CONFIG.twitch.channel,
      message,
      botSpeak: this.botSpeak,
      platform: Platform.Twitch
    };

    if (tags) {
      context.tags = tags;
    } else {
      // If no tags, then it's a command being run directly by the owner
      context.isOwnerRun = true;
      context.onBehalfOf = opts?.onBehalfOf;
      context.tags = {
        username: CONFIG.twitch.ownerUsername,
        owner: true,
        mod: true,
        subscriber: true,
        ['display-name']: CONFIG.twitch.ownerUsername
      };
    }

    const user = await this.helixGetTwitchUserInfo(
      context.tags['display-name']
    );

    if (user) {
      context.tags.follower = user.isFollower;
    }

    if (context.message?.startsWith('!')) {
      const args = context.message
        .slice(1)
        .split(' ')
        .filter((e) => e !== '');
      const command = args.shift();

      context.body = context.message.replace(`!${command}`, '').trim();
      context.args = args;
      context.command = command.toLowerCase();
    }

    if (
      [
        CONFIG.twitch.ownerUsername.toLowerCase(),
        CONFIG.twitch.botUsername.toLowerCase()
      ].includes(context.tags.username)
    ) {
      // Just make sure the owner gets everything
      context.tags.owner = true;
      context.tags.mod = true;
      context.tags.subscriber = true;
    }

    return context;
  }

  async autoRespond(message: string) {
    if (!CONFIG.autoResponder) return;

    let found = false;
    for (const match of CONFIG.autoResponder) {
      if (found) break;
      for (const phrase of match.phrases) {
        const regex = new RegExp(phrase, 'gi');
        if (message.match(regex)) {
          for (const response of match.responses) {
            if (response.startsWith('!')) {
              await this.ownerRunCommand(response);
            } else {
              this.botSpeak(response);
            }
          }
          found = true;
          break;
        }
      }
    }
  }

  /***
   * TWITCH HELIX API CALLS
   */

  async helixApiCall(
    url: string,
    method = 'GET',
    body = undefined,
    asOwner = true
  ): Promise<{ data: unknown }> {
    const token = asOwner
      ? CONFIG.twitch.apiOwnerOauthToken
      : CONFIG.twitch.apiBotOauthToken;

    const request = {
      url,
      headers: {
        'Client-ID': CONFIG.twitch.apiClientId,
        Authorization: `Bearer ${token}`
      },
      method
    };

    if (body) {
      request['headers']['Content-type'] = 'application/json';
      request['body'] = JSON.stringify(body);
    }

    try {
      const res = await fetch(url, request);
      return await res.json();
    } catch (e) {
      // no json to parse which is fine
    }
  }

  async helixGetTwitchUserInfo(login: string) {
    login = login.toLowerCase();
    if (!twitchUserMap[login]) {
      // Get their twitch id
      const res: { data: [{ id: string }] } = <{ data: [{ id: string }] }>(
        await this.helixApiCall(
          `https://api.twitch.tv/helix/users?login=${login}`,
          'GET'
        )
      );
      const id = res?.data[0]?.id;
      if (!id) return;

      // See if they are a follower
      const res2: { data: unknown[] } = <{ data: unknown[] }>(
        await this.helixApiCall(
          `https://api.twitch.tv/helix/channels/followers?user_id=${id}&broadcaster_id=${CONFIG.twitch.ownerId}`,
          'GET'
        )
      );
      const isFollower = !!res2?.data[0];

      twitchUserMap[login] = { id, isFollower };
    }
    return twitchUserMap[login];
  }

  async helixShoutout(login: string) {
    try {
      const user = await this.helixGetTwitchUserInfo(login);
      if (!user) return;
      await this.helixApiCall(
        `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${CONFIG.twitch.ownerId}&to_broadcaster_id=${user.id}&moderator_id=${CONFIG.twitch.botId}`,
        'POST',
        false,
        false
      );
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Error sending shoutout');
    }
  }
}
