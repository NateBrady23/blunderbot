import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { TwitchGateway } from '../twitch/twitch.gateway';
import { TwitchService } from '../twitch/twitch.service';
import { DiscordService } from '../discord/discord.service';
import { OpenaiService } from '../openai/openai.service';
import { GiphyService } from '../giphy/giphy.service';
import { LichessService } from '../lichess/lichess.service';
import { AppGateway } from '../app.gateway';
import { BrowserService } from '../browser/browser.service';
import { CONFIG } from '../config/config.service';
import { TwitterService } from '../twitter/twitter.service';
import { SpotifyService } from '../spotify/spotify.service';
import { Platform } from '../enums';
import { StoredCommandEntityService } from '../models/stored-command/stored-command.service';

@Injectable()
export class CommandService {
  private logger: Logger = new Logger(CommandService.name);
  private commandState: CommandState;
  private readonly services: CommandServices;

  constructor(
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateway: AppGateway,
    @Inject(forwardRef(() => BrowserService))
    private readonly browserService: BrowserService,
    @Inject(forwardRef(() => TwitchGateway))
    private readonly twitchGateway: TwitchGateway,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService,
    @Inject(forwardRef(() => TwitterService))
    private readonly twitterService: TwitterService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
    @Inject(forwardRef(() => GiphyService))
    private readonly giphyService: GiphyService,
    @Inject(forwardRef(() => OpenaiService))
    private readonly openaiService: OpenaiService,
    @Inject(forwardRef(() => SpotifyService))
    private readonly spotifyService: SpotifyService,
    @Inject(forwardRef(() => LichessService))
    private readonly lichessService: LichessService,
    @Inject(forwardRef(() => StoredCommandEntityService))
    private readonly storedCommandEntityService: StoredCommandEntityService
  ) {
    this.services = {
      appGateway: this.appGateway,
      browserService: this.browserService,
      commandService: this,
      discordService: this.discordService,
      twitchGateway: this.twitchGateway,
      twitchService: this.twitchService,
      twitterService: this.twitterService,
      openaiService: this.openaiService,
      spotifyService: this.spotifyService,
      lichessService: this.lichessService,
      giphyService: this.giphyService,
      // Entity services
      storedCommandEntityService: this.storedCommandEntityService
    };

    this.setInitialCommandState();

    if (CONFIG.get().heartRate?.enabled) {
      void this.heartRateCheck();
    }

    void this.setStoredCommands();
  }

  setInitialCommandState() {
    this.commandState = {
      arena: '',
      boughtSquares: {},
      first: '',
      challengeQueue: [],
      isLive: false,
      limitedCommands: {},
      toggledOffCommands: [],
      killedCommands: CONFIG.get().killedCommands,
      heartRateHigh: 0,
      blunderBotPersonality: '',
      blunderbotVoice: <OpenAiVoiceOptions>CONFIG.get().openai?.voices[0],
      storedCommands: {},
      cbanUsers: [],
      wouldBeCommands: {},
      contributions: {
        bits: {},
        subs: {},
        raids: {}
      },
      trivia: {
        started: false,
        round: 0,
        leaderboard: {},
        answeredUsers: []
      },
      spotify: {
        requests: {}
      }
    };
  }

  async heartRateCheck() {
    const thresholds = [140, 130, 120, 110, 100];

    const heartRateInterval = setInterval(async () => {
      if (!this.browserService.isBrowserLoaded()) return;
      if (!this.commandState.isLive) return;

      try {
        const heartRate = await this.browserService.getHeartRate();
        for (const threshold of thresholds) {
          if (
            heartRate >= threshold &&
            this.commandState.heartRateHigh < threshold
          ) {
            this.commandState.heartRateHigh = heartRate;
            void this.twitchService.ownerRunCommand(
              `!tts ${
                CONFIG.get().nickname
              }'s heart rate has crossed the ${threshold} BPM threshold for the first time this stream at ${heartRate} BPM`
            );
            if (threshold === 140) clearInterval(heartRateInterval);
            break;
          }
        }
      } catch (error) {
        console.error('Error getting heart rate:', error);
        clearInterval(heartRateInterval);
      }
    }, 1000);
  }

  async canRun(ctx: Context, cmd: Command): Promise<boolean> {
    if (!cmd.platforms.includes(ctx.platform)) {
      return;
    }

    if (this.commandState.cbanUsers.includes(ctx.displayName.toLowerCase())) {
      this.logger.log(`User ${ctx.displayName} is cban'd`);
      return false;
    }

    // If the command is killed, don't run for anyone including the owner
    if (this.commandState.killedCommands?.includes(cmd.name)) {
      this.logger.log(`${cmd.name} is killed and will not run`);
      return false;
    }

    if (cmd.requiresLive && !this.commandState.isLive) {
      ctx.botSpeak(
        `${CONFIG.get().twitch.channel} is not live until I SAY HE'S LIVE!`
      );
      return false;
    }

    // The owner/bot can always run commands despite cooldown, etc
    if (ctx.isOwner) {
      return true;
    } else if (cmd.ownerOnly) {
      // If the command is ownerOnly and the user is not the owner, don't run
      return false;
    }

    // If the command is toggled off, don't run for anyone but the owner
    if (this.commandState.toggledOffCommands.includes(cmd.name)) {
      ctx.botSpeak(`!${cmd.name} is currently disabled`);
      return false;
    }

    if (ctx.platform === Platform.Twitch) {
      if (
        CONFIG.get().twitch.subCommands?.includes(cmd.name) &&
        !ctx.isSubscriber
      ) {
        ctx.botSpeak(
          `@${ctx.displayName} !${cmd.name} is for subscribers only. You can subscribe for free if you have Amazon Prime!`
        );
        return false;
      }

      if (
        CONFIG.get().twitch.followerCommands?.includes(cmd.name) &&
        !ctx.isFollower
      ) {
        ctx.botSpeak(`@${ctx.displayName} !${cmd.name} is for followers only.`);
        return false;
      }

      if (CONFIG.get().twitch.vipCommands?.includes(cmd.name) && !ctx.isVip) {
        ctx.botSpeak(`@${ctx.displayName} !${cmd.name} is for VIPs only.`);
        return false;
      }

      if (
        CONFIG.get().twitch.founderCommands?.includes(cmd.name) &&
        !ctx.isFounder
      ) {
        ctx.botSpeak(`@${ctx.displayName} !${cmd.name} is for founders only.`);
        return false;
      }

      if (
        CONFIG.get().twitch.hypeTrainConductorCommands?.includes(cmd.name) &&
        !ctx.isHypeTrainConductor
      ) {
        ctx.botSpeak(
          `@${ctx.displayName} !${cmd.name} is for Hype Train Conductors only.`
        );
        return false;
      }
    }

    // Returns if the command is modOnly and the user is not at least a mod
    if (cmd.modOnly && !ctx.isMod) {
      return false;
    }

    // Don't run if there's still some cooling down to do.
    if (cmd.lastRun + (cmd.coolDown || 0) > Date.now()) {
      this.logger.log(
        `${ctx.command} by ${ctx.displayName} needed to cool down.`
      );
      return false;
    }

    // Checks to see if the command is limited
    const limitedTo = CONFIG.get().twitch.limitedCommands[cmd.name];
    if (limitedTo && limitedTo > 0) {
      if (!this.commandState.limitedCommands[cmd.name]) {
        this.commandState.limitedCommands[cmd.name] = {};
      }
      if (
        (this.commandState.limitedCommands[cmd.name][ctx.displayName] || 0) >=
        limitedTo
      ) {
        // If the user has used the command too many times, don't run
        ctx.botSpeak(
          `@${ctx.displayName} !${cmd.name} is limited to ${limitedTo} time(s) per stream.`
        );
        return false;
      }
    }

    const userRestricted = CONFIG.get().twitch.userRestrictedCommands[cmd.name];
    if (userRestricted) {
      const found = userRestricted.some((user) => {
        return user.toLowerCase() === ctx.displayName.toLowerCase();
      });
      if (!found) {
        ctx.botSpeak(
          `The !${cmd.name} command is only for ${userRestricted.join(' and ')}`
        );
        return false;
      }
      return true;
    }

    return true;
  }

  findCommand(name: string): Command | undefined {
    const commands = CONFIG.get().commands;
    name = name.toLowerCase();
    const commandKeys = Object.keys(commands);

    let cmd: Command | undefined;

    // First let's look for an exact match for command names
    if (commandKeys.includes(name)) {
      cmd = commands[name];
    } else {
      for (const c of commandKeys) {
        // Look for the first command that starts with the command sent to provide a shortcut for making commands
        if (!cmd && c.startsWith(name)) {
          cmd = commands[c];
        }
        // However, prefer an exact match for aliases
        const currCmd = commands[c];
        if (currCmd.aliases && currCmd.aliases.includes(name)) {
          cmd = currCmd;
          break;
        }
      }
    }

    return cmd;
  }

  async run(ctx: Context) {
    if (!ctx.command) return;

    // Silly for !1455 = 1455's are hard...
    if (ctx.command.match(/^\d\d?\d?\d?$/)) {
      ctx.botSpeak(`${ctx.command}'s are hard...`);
      return;
    }

    const cmd = this.findCommand(ctx.command);

    // If we have a command but for some reason can't run it, short circuit
    if (cmd) {
      if (!(await this.canRun(ctx, cmd))) return;
      // Run the command. If it returns true, it ran successfully, so update the lastRun time
      try {
        // Otherwise, use the command's run function
        if (
          await cmd.run(ctx, {
            services: this.services,
            commandState: this.commandState
          })
        ) {
          cmd.lastRun = Date.now();
          if (this.commandState.limitedCommands[cmd.name]) {
            this.commandState.limitedCommands[cmd.name][ctx.displayName] =
              (this.commandState.limitedCommands[cmd.name][ctx.displayName] ||
                0) + 1;
          }
        }
      } catch (e) {
        this.logger.error(e);
        this.logger.error(`Error running ${ctx.command} command`);
      }
      return;
    }

    // Run any commands created during the stream with !add
    if (this.commandState.storedCommands[ctx.command]) {
      ctx.botSpeak(this.commandState.storedCommands[ctx.command]);
      return;
    }

    // If we're here, we didn't find a command, so let's see if we can use the AI to find one
    // unless this is a non-follower.
    if (!ctx.isOwner && ctx.platform === Platform.Twitch && ctx.isFollower) {
      void this.twitchService.ownerRunCommand('!suggest ' + ctx.command);
    }
  }

  async getCommandState() {
    return this.commandState;
  }

  async setStoredCommands() {
    if (!CONFIG.get().db?.enabled) {
      return {};
    }
    const storedCommandsArr = await this.storedCommandEntityService.findAll();
    this.commandState.storedCommands = {};
    for (const sc of storedCommandsArr) {
      this.commandState.storedCommands[sc.name] = sc.message;
    }
  }

  updateBoughtSquares(data: { [key: string]: string }) {
    this.commandState.boughtSquares = data;
  }
}
