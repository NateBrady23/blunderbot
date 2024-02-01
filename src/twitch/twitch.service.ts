import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import { TwitchGateway } from './twitch.gateway';
import { CommandService } from '../command/command.service';
import { writeLog } from '../utils/logs';
import { Platform } from '../enums';
import { chessSquares } from '../utils/constants';
import { getRandomElement } from '../utils/utils';

let shoutoutUsers = CONFIG.get().autoShoutouts || [];
const newChatters: string[] = [];

// Twitch user map is for determining followers and first time chatters
const twitchUserMap: Record<string, { id: string; isFollower: boolean }> = {};
twitchUserMap[CONFIG.get().twitch.ownerUsername.toLowerCase()] = {
  id: CONFIG.get().twitch.ownerId,
  isFollower: true
};
twitchUserMap[CONFIG.get().twitch.botUsername.toLowerCase()] = {
  id: CONFIG.get().twitch.botId,
  isFollower: true
};

let boughtSquares = {};

@Injectable()
export class TwitchService {
  private logger: Logger = new Logger(TwitchService.name);

  constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: CommandService,
    @Inject(forwardRef(() => TwitchGateway))
    private readonly twitchGateway: TwitchGateway
  ) {
    // TODO: Remove this in favor of proper static methods
    this.botSpeak = this.botSpeak.bind(this);
  }

  botSpeak(message: string) {
    // void this.client.say(CONFIG.get().twitch.channel, message);
    void this.helixApiCall(
      'https://api.twitch.tv/helix/chat/messages',
      'POST',
      {
        broadcaster_id: CONFIG.get().twitch.ownerId,
        sender_id: CONFIG.get().twitch.botId,
        message
      },
      false
    );
  }

  checkForShoutout(user: string) {
    user = user.toLowerCase();
    if (shoutoutUsers.includes(user)) {
      void this.ownerRunCommand(`!so ${user}`);
      shoutoutUsers = shoutoutUsers.filter((u) => u !== user);
    }
  }

  updateBoughtSquares(data: unknown) {
    boughtSquares = data;
  }

  async onMessageHandler(data: OnMessageHandlerInput) {
    let message = data.message;
    void writeLog('chat', `${data.displayName}: ${message}`);
    const regex = new RegExp(
      `^@${CONFIG.get().twitch.botUsername}|@${
        CONFIG.get().twitch.botUsername
      }$`,
      'i'
    );
    if (regex.test(message)) {
      const replaceRegex = new RegExp(
        `@${CONFIG.get().twitch.botUsername} `,
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
          CONFIG.get().twitch.welcome?.enabled &&
          !CONFIG.get().twitch.welcome.ignoreUsers.includes(displayName)
        ) {
          const message = CONFIG.get().twitch.welcome.message.replace(
            /{user}/gi,
            `@${displayName}`
          );
          this.botSpeak(message);
        }
      } else if (!context.isOwner) {
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
      this.checkForShoutout(context.username);
    }

    // The message isn't a command or custom reward, so see if it's something we
    // should auto-respond to and then return. Don't auto respond to the bot.
    if (
      !context.message.startsWith('!') &&
      !data.channelPointsCustomRewardId &&
      !data.userLogin
        .toLowerCase()
        .includes(CONFIG.get().twitch.botUsername.toLowerCase())
    ) {
      void this.autoRespond(message);
      return;
    }

    if (!data.channelPointsCustomRewardId) {
      await this.commandService.run(context);
    }
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
    data?: OnMessageHandlerInput,
    opts?: CreateContextOptions
  ): Promise<Context> {
    const context: Partial<Context> = {
      channel: CONFIG.get().twitch.channel,
      message,
      reply: (ctx: Context, message) =>
        this.botSpeak(`@${ctx.onBehalfOf || ctx.displayName} ${message}`),
      botSpeak: this.botSpeak,
      platform: Platform.Twitch
    };

    if (data) {
      context.isOwner = data.isOwner;
      context.isMod = data.isMod;
      context.isSubscriber = data.isSub;
      context.username = data.userLogin;
      context.displayName = data.displayName;
    } else {
      // If no data, then it's a command being run directly by the owner
      context.isOwnerRun = true;
      context.onBehalfOf = opts?.onBehalfOf;
      context.username = CONFIG.get().twitch.ownerUsername.toLowerCase();
      context.displayName = CONFIG.get().twitch.ownerUsername;
      context.isOwner = true;
      context.isMod = true;
      context.isSubscriber = true;
    }

    const user = await this.helixGetTwitchUserInfo(context.displayName);

    if (user) {
      context.isFollower = user.isFollower;
    }

    if (context.message?.startsWith('!')) {
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

  async autoRespond(message: string) {
    if (!CONFIG.get().autoResponder) return;

    let found = false;
    for (const match of CONFIG.get().autoResponder) {
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
    body: any = undefined,
    asOwner = true
  ): Promise<any> {
    const token = asOwner
      ? CONFIG.get().twitch.apiOwnerOauthToken
      : CONFIG.get().twitch.apiBotOauthToken;

    const headers = new Headers();
    headers.set('Client-ID', CONFIG.get().twitch.apiClientId);
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
      return await res.json();
    } catch (e) {
      // no json to parse which is fine
      this.logger.log(`No JSON to parse for ${url}`);
    }
  }

  async helixGetTwitchUserInfo(login: string, bustCache = false) {
    login = login.toLowerCase();
    if (bustCache || !twitchUserMap[login]) {
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
          `https://api.twitch.tv/helix/channels/followers?user_id=${id}&broadcaster_id=${
            CONFIG.get().twitch.ownerId
          }`,
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
        `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${
          CONFIG.get().twitch.ownerId
        }&to_broadcaster_id=${user.id}&moderator_id=${
          CONFIG.get().twitch.botId
        }`,
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
