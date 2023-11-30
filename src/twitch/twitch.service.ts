import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ENV } from '../config/config.service';
import { removeSymbols } from '../utils/utils';
import { TwitchGateway } from './twitch.gateway';
import { CommandService } from '../command/command.service';
import { writeLog } from '../utils/logs';
import { Platform } from '../enums';
const tmi = require('tmi.js');

let shoutoutUsers = ENV.SHOUTOUT_USERS;
const challengeQueue = [];
const newChatters = [];

// Twitch user map is for determining followers and first time chatters
const twitchUserMap: Record<string, { id: string; isFollower: boolean }> = {};
twitchUserMap[ENV.TWITCH_OWNER_USERNAME.toLowerCase()] = {
  id: ENV.TWITCH_OWNER_ID,
  isFollower: true
};
twitchUserMap[ENV.TWITCH_BOT_USERNAME.toLowerCase()] = {
  id: ENV.TWITCH_BOT_ID,
  isFollower: true
};

@Injectable()
export class TwitchService {
  private logger: Logger = new Logger('TwitchService');

  private opts = {
    identity: {
      username: ENV.TWITCH_BOT_USERNAME,
      password: ENV.TWITCH_BOT_PASSWORD
    },
    channels: [ENV.TWITCH_CHANNEL]
  };

  public client;

  constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: CommandService,
    @Inject(forwardRef(() => TwitchGateway))
    private readonly twitchGateway: TwitchGateway
  ) {
    this.client = new tmi.client(this.opts);

    this.client.connect();

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
    this.client.say(ENV.TWITCH_CHANNEL, message);
  }

  checkForShoutout(ctx: Context) {
    const userToCheck = ctx.tags.username.toLowerCase();
    if (shoutoutUsers.includes(userToCheck)) {
      void this.ownerRunCommand(`!so ${userToCheck}`);
      shoutoutUsers = shoutoutUsers.filter((user) => user !== userToCheck);
    }
  }

  onConnectedHandler(address, port) {
    this.logger.log(`* Connected to ${address}:${port}`);
  }

  async onMessageHandler(channel, tags, message) {
    if (message) {
      void writeLog('chat', `${tags['display-name']}: ${message}`);
    }
    // TODO: Replace with compiled regex using bot name env
    // Turn blunderbot23 pings into !chat commands so it replies
    if (message.match(/^@blunderbot23|@blunderbot23$/i)) {
      message = '!chat ' + message.replace(/^@blunderbot23 /i, '');
    }
    const context: Context = await this.createContext(message, tags);

    // TODO: Make env var to say hi to new chatters and change the welcome message
    if (!context.tags.follower) {
      const displayName = context.tags['display-name'];
      if (!newChatters.includes(displayName)) {
        newChatters.push(displayName);
        this.botSpeak(
          `Welcome in, @${displayName}! Hope you stick around awhile!`
        );
      }
    }

    // TODO: Make env var to enable/disable auto shoutouts
    // If the message isn't a !so command, check to see if this user needs
    // to be shouted out!
    if (!context.message.startsWith('!so ')) {
      this.checkForShoutout(context);
    }

    // The message isn't a command or custom reward, so see if it's something we
    // should auto-respond to and then return.
    if (!context.message.startsWith('!') && !tags['custom-reward-id']) {
      void this.autoRespond(message);
      return;
    }

    if (tags['custom-reward-id']) {
      await this.handleCustomRewards(context);
    } else {
      await this.commandService.run(context);
    }
  }

  async onSubscriptionHandler(channel, username, method, message, userstate) {
    // Do your stuff.
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

  async onResubHandler(channel, username, months, message, userstate, methods) {
    // Do your stuff.
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
    channel,
    username,
    streakMonths,
    recipient,
    methods,
    userstate
  ) {
    // Do your stuff.
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
    channel,
    username,
    streakMonths,
    recipient,
    methods,
    userstate
  ) {
    // Do your stuff.
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

  async onRaidHandler(channel, username, _viewers) {
    void this.ownerRunCommand(`!raids ${username}`);
  }

  async onCheerHandler(channel, userstate, message) {
    const bits = parseInt(userstate.bits) || 0;
    const obj = {
      message,
      bits,
      user: userstate['display-name']
    };

    void this.ownerRunCommand(`!bits ${JSON.stringify(obj)}`);
  }

  // TODO: A better way to handle custom rewards so they can be easily added
  async handleCustomRewards(ctx: Context): Promise<void> {
    this.logger.log(`Custom Reward ID: ${ctx.tags['custom-reward-id']}`);
    // Change my opponent's rating
    if (
      ctx.tags['custom-reward-id'] === 'dea7ef8d-eb78-4e59-966c-952db27ce50a'
    ) {
      let rating: string | number = ctx.message;
      rating = parseInt(rating);
      if (isNaN(rating) || rating < 1 || rating > 9999) {
        return;
      }

      this.twitchGateway.sendDataToSockets('serverMessage', {
        type: 'OPP_RATING',
        rating,
        user: ctx.tags['display-name']
      });
    }

    // Add to the challenge queue
    if (
      ctx.tags['custom-reward-id'] === '281df6b2-4e17-4573-adde-403f7eb1f491'
    ) {
      challengeQueue.push({
        twitchUser: ctx.tags['display-name'],
        lichessUser: ctx.message
      });
      ctx.botSpeak(`@${ctx.tags['display-name']} has joined the queue!`);
      void this.ownerRunCommand(
        `!tts ${removeSymbols(ctx.tags['display-name'])} has joined the queue!`
      );
    }

    // Change BlunderBot's Personality
    if (
      ctx.tags['custom-reward-id'] === '308d9f77-f238-46e0-9aef-bc1fe33c151b'
    ) {
      void this.ownerRunCommand(`!personality ${ctx.message}`);
    }

    // Buy a Square
    if (
      ctx.tags['custom-reward-id'] === '20379aae-5498-4a0f-8344-ae2ac391b8f2'
    ) {
      const square = ctx.message.trim().substring(0, 2).toLowerCase();
      void this.ownerRunCommand(`!buy ${square} ${ctx.tags['display-name']}`);
    }

    // Play a gif
    if (
      ctx.tags['custom-reward-id'] === 'e4474c8e-eeaa-4724-abfb-af688ce88c47'
    ) {
      void this.ownerRunCommand(`!gif ${ctx.message}`);
    }

    // Title Me on Lichess
    if (
      ctx.tags['custom-reward-id'] === '7a23bf6a-74b7-4423-a659-dc502b428b6d'
    ) {
      void this.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} would like to be titled on lichess. They chose: ${ctx.message}`
      );
    }

    // Create an opp king
    if (
      ctx.tags['custom-reward-id'] === '444a39bb-04ce-4b43-b68a-6d58a44fb678'
    ) {
      void this.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} would like you to create them an opponent king. They chose: ${
          ctx.message
        }`
      );
    }

    // Invert the board colors
    if (ctx.tags['custom-reward-id'] === 'Inverts the board colors') {
      void this.ownerRunCommand(`!theme flipped`);
    }

    // Guide the raid
    if (
      ctx.tags['custom-reward-id'] === 'e4ec9f36-f2e6-4a5d-9b6f-5907fa45cfdb'
    ) {
      void this.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} is guiding the raid to ${removeSymbols(ctx.message)}`
      );
    }

    // Change blunderbot's voice
    if (
      ctx.tags['custom-reward-id'] === 'ad81a974-233d-4910-abf2-be72aafebe66'
    ) {
      void this.ownerRunCommand(`!voice ${removeSymbols(ctx.message)}`);
    }

    // Run a poll
    if (
      ctx.tags['custom-reward-id'] === '8027dfce-78d4-49a6-b9ce-f018d0721dad'
    ) {
      void this.ownerRunCommand(`!poll ${removeSymbols(ctx.message)}`);
    }
  }

  async tellAllConnectedClientsToRefresh() {
    try {
      this.twitchGateway.sendDataToSockets('serverMessage', {
        type: 'REFRESH'
      });
    } catch (e) {
      console.log(e);
    }
  }

  async ownerRunCommand(message: string) {
    const context: Context = await this.createContext(message);
    await this.commandService.run(context);
  }

  async createContext(message: string, tags?: any): Promise<Context> {
    const context: Context = {
      client: this.client,
      channel: ENV.TWITCH_CHANNEL,
      message,
      botSpeak: this.botSpeak,
      platform: Platform.Twitch
    };

    if (tags) {
      context.tags = tags;
    } else {
      context.tags = {
        username: ENV.TWITCH_OWNER_USERNAME,
        owner: true,
        mod: true,
        subscriber: true,
        ['display-name']: ENV.TWITCH_OWNER_USERNAME
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
        .filter((e) => e !== ' ');
      const command = args.shift();

      context.body = context.message.replace(`!${command}`, '').trim();
      context.args = args;
      context.command = command.toLowerCase();
    }

    if (
      [
        ENV.TWITCH_OWNER_USERNAME.toLowerCase(),
        ENV.TWITCH_BOT_USERNAME.toLowerCase()
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
    message = message.toLowerCase();
    if (message.match(/^what(')?s bm$/gi)) {
      return await this.ownerRunCommand('!bm');
    }

    if (
      message.includes('what') &&
      message.match(/is|does|stand|mean/gi) &&
      message.includes('bm')
    ) {
      return await this.ownerRunCommand('!bm');
    }

    if (message.includes('your favorite opening')) {
      return await this.ownerRunCommand('!opening');
    }

    if (message.match(/1v1\?|want to play|wanna play/gi)) {
      return await this.ownerRunCommand('!challenge');
    }
  }

  getChallengeQueue() {
    return challengeQueue;
  }

  /***
   * TWITCH HELIX API CALLS
   */

  async helixApiCall(
    url,
    method = 'GET',
    body = undefined,
    asOwner = true
  ): Promise<any> {
    const token = asOwner
      ? ENV.TWITCH_API_OWNER_OAUTH_TOKEN
      : ENV.TWITCH_API_BOT_OAUTH_TOKEN;

    const request = {
      url,
      headers: {
        'Client-ID': ENV.TWITCH_API_CLIENT_ID,
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
      const json = await res.json();
      console.log(json);
      return json;
    } catch (e) {
      // no json to parse which is fine
    }
  }

  async helixOwnerApiCall(url, method = 'GET', body = undefined): Promise<any> {
    return this.helixApiCall(url, method, body, true);
  }

  async helixBotApiCall(url, method = 'GET', body = undefined): Promise<any> {
    return this.helixApiCall(url, method, body, false);
  }

  async helixGetTwitchUserInfo(login: string) {
    login = login.toLowerCase();
    if (!twitchUserMap[login]) {
      // Get their twitch id
      let res = await this.helixOwnerApiCall(
        `https://api.twitch.tv/helix/users?login=${login}`,
        'GET'
      );
      const id = res?.data[0]?.id;
      if (!id) return;

      // See if they are a follower
      res = await this.helixOwnerApiCall(
        `https://api.twitch.tv/helix/channels/followers?user_id=${id}&broadcaster_id=${ENV.TWITCH_OWNER_ID}`,
        'GET'
      );
      const isFollower = !!res?.data[0];

      twitchUserMap[login] = { id, isFollower };
    }
    return twitchUserMap[login];
  }

  /***
   * TODO: Maybe alternate between bot/owner tokens to avoid rate limiting
   * @param login
   */
  async helixShoutout(login: string) {
    try {
      const user = await this.helixGetTwitchUserInfo(login);
      if (!user) return;
      await this.helixBotApiCall(
        `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${ENV.TWITCH_OWNER_ID}&to_broadcaster_id=${user.id}&moderator_id=${ENV.TWITCH_BOT_ID}`,
        'POST',
        false
      );
    } catch (e) {
      console.log(e);
      this.logger.error('Error sending shoutout');
    }
  }
}
