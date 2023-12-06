import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { TwitchGateway } from '../twitch/twitch.gateway';
import { commands } from './commands';
import { TwitchService } from '../twitch/twitch.service';
import { DiscordService } from '../discord/discord.service';
import { OpenaiService } from '../openai/openai.service';
import { GiphyService } from '../giphy/giphy.service';
import { LichessService } from '../lichess/lichess.service';
import { AppGateway } from '../app.gateway';
import { BrowserService } from '../browser/browser.service';
import { ENV } from '../config/config.service';
import { TwitchCustomRewardsService } from '../twitch/twitch.custom-rewards';

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
    @Inject(forwardRef(() => TwitchCustomRewardsService))
    private readonly twitchCustomRewardsService: TwitchCustomRewardsService,
    @Inject(forwardRef(() => TwitchGateway))
    private readonly twitchGateway: TwitchGateway,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
    @Inject(forwardRef(() => GiphyService))
    private readonly giphyService: GiphyService,
    @Inject(forwardRef(() => OpenaiService))
    private readonly openaiService: OpenaiService,
    @Inject(forwardRef(() => LichessService))
    private readonly lichessService: LichessService
  ) {
    this.services = {
      appGateway: this.appGateway,
      browserService: this.browserService,
      discordService: this.discordService,
      twitchCustomRewardsService: this.twitchCustomRewardsService,
      twitchGateway: this.twitchGateway,
      twitchService: this.twitchService,
      openaiService: this.openaiService,
      lichessService: this.lichessService,
      giphyService: this.giphyService
    };

    this.setInitialCommandState();

    if (ENV.HEART_RATE_ENABLED) {
      void this.heartRateCheck();
    }
  }

  setInitialCommandState() {
    this.commandState = {
      arena: '',
      first: '',
      isLive: false,
      limitedCommands: {},
      toggledOffCommands: [],
      killedCommands: [],
      heartRateHigh: 0,
      blunderBotPersonality: '',
      blunderbotVoice: 'onyx',
      ephemeralCommands: {},
      cbanUsers: [],
      wouldBeCommands: {},
      contributions: {
        bits: {},
        subs: {},
        raids: {}
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
              `!tts Nate's heart rate has crossed the ${threshold} BPM threshold for the first time this stream at ${heartRate} BPM`
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

    if (
      this.commandState.cbanUsers.includes(
        ctx.tags['display-name'].toLowerCase()
      )
    ) {
      this.logger.log(`User ${ctx.tags['display-name']} is cban'd`);
      return false;
    }

    // If the command is killed, don't run for anyone including the owner
    if (this.commandState.killedCommands.includes(cmd.name)) {
      this.logger.log(`${cmd.name} is killed and will not run`);
      return false;
    }

    if (cmd.requiresLive && !this.commandState.isLive) {
      ctx.botSpeak(
        `I have not made the Discord announcement yet, so NateBrady23 is not live yet. He's not live until I SAY HE'S LIVE!`
      );
      return false;
    }

    // The owner/bot can always run commands despite cooldown, etc
    if (ctx.tags.owner) {
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

    if (ctx.platform === 'twitch' && cmd.subOnly && !ctx.tags.subscriber) {
      ctx.botSpeak(
        `@${ctx.tags['display-name']} !${cmd.name} is for subscribers only. You can subscribe for free if you have Amazon Prime!`
      );
      return false;
    }

    if (ctx.platform === 'twitch' && cmd.followerOnly && !ctx.tags.follower) {
      ctx.botSpeak(
        `@${ctx.tags['display-name']} !${cmd.name} is for followers only.`
      );
      return false;
    }

    // Returns if the command is modOnly and the user is not at least a mod
    if (cmd.modOnly && !ctx.tags.mod) {
      return false;
    }

    // Don't run if there's still some cooling down to do.
    if (cmd.lastRun + (cmd.coolDown || 0) > Date.now()) {
      this.logger.log(
        `${ctx.command} by ${ctx.tags['display-name']} needed to cool down.`
      );
      return false;
    }

    // Checks to see if the command is limited
    if (cmd?.limitedTo > 0) {
      if (!this.commandState.limitedCommands[cmd.name]) {
        this.commandState.limitedCommands[cmd.name] = {};
      }
      if (
        !this.commandState.limitedCommands[cmd.name][ctx.tags['display-name']]
      ) {
        // If the user hasn't used the command yet, set it to 0
        this.commandState.limitedCommands[cmd.name][ctx.tags['display-name']] =
          0;
      }
      if (
        this.commandState.limitedCommands[cmd.name][ctx.tags['display-name']] >=
        cmd.limitedTo
      ) {
        // If the user has used the command too many times, don't run
        ctx.botSpeak(
          `@${ctx.tags['display-name']} !${cmd.name} is limited to ${cmd.limitedTo} time(s) per stream.`
        );
        return false;
      }
      this.commandState.limitedCommands[cmd.name][ctx.tags['display-name']]++;
    }

    return true;
  }

  async run(ctx: Context) {
    if (!ctx.command) return;

    // Silly for !1455 = 1455's are hard...
    if (ctx.command.match(/^\d\d?\d?\d?$/)) {
      ctx.botSpeak(`${ctx.command}'s are hard...`);
      return;
    }

    let cmd;
    const commandKeys = Object.keys(commands);

    // First let's look for an exact match for command names
    if (commandKeys.includes(ctx.command)) {
      cmd = commands[ctx.command];
    } else {
      for (const c of commandKeys) {
        // Look for the first command that starts with the command sent to provide a shortcut for making commands
        if (!cmd && c.startsWith(ctx.command)) {
          cmd = commands[c];
        }
        // However, prefer an exact match for aliases
        const currCmd = commands[c];
        if (currCmd.aliases && currCmd.aliases.includes(ctx.command)) {
          cmd = currCmd;
          break;
        }
      }
    }

    // If we have a command but for some reason can't run it, short circuit
    if (cmd) {
      if (!(await this.canRun(ctx, cmd))) return;
      // Run the command. If it returns true, it ran successfully, so update the lastRun time
      try {
        if (
          await cmd.run(ctx, {
            services: this.services,
            commands,
            commandState: this.commandState
          })
        ) {
          cmd.lastRun = Date.now();
        }
      } catch (e) {
        this.logger.log(e);
        this.logger.log(`Error running ${ctx.command} command`);
      }
      return;
    }

    if (this.commandState.ephemeralCommands[ctx.command]) {
      ctx.botSpeak(this.commandState.ephemeralCommands[ctx.command]);
      return;
    }

    // If we're here, we didn't find a command, so let's see if we can use the AI to find one
    // unless this is a non-follower.
    if (ctx.platform === 'twitch' && ctx.tags.follower) {
      void this.twitchService.ownerRunCommand('!suggest ' + ctx.command);
    }
  }

  async getCommandState() {
    return this.commandState;
  }
}
