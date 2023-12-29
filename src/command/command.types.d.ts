import { TwitchGateway } from '../twitch/twitch.gateway';
import { TwitchService } from '../twitch/twitch.service';
import { TwitchCustomRewardsService } from '../twitch/twitch.custom-rewards';
import { OpenaiService } from '../openai/openai.service';
import { LichessService } from '../lichess/lichess.service';
import { GiphyService } from '../giphy/giphy.service';
import { DiscordService } from '../discord/discord.service';
import { BrowserService } from '../browser/browser.service';
import { AppGateway } from '../app.gateway';

declare global {
  interface CommandRunFuncOptions {
    services: CommandServices;
    commandState: CommandState;
    commands: Command[];
  }

  interface CommandRunFunc {
    (ctx: Context, obj: CommandRunFuncOptions): boolean | Promise<boolean>;
  }

  interface Command {
    name: string;
    // Deprecated?
    queued?: boolean;
    run: CommandRunFunc;
    help?: string;
    coolDown?: number;
    modOnly?: boolean;
    ownerOnly?: boolean;
    // If true, the twitch stream must be live for the command to run
    requiresLive?: boolean;
    // timestamp
    lastRun?: number;
    aliases?: string[];
    platforms: Platforms[];
  }

  interface CommandServices {
    appGateway: AppGateway;
    browserService: BrowserService;
    discordService: DiscordService;
    giphyService: GiphyService;
    lichessService: LichessService;
    openaiService: OpenaiService;
    twitchCustomRewardsService: TwitchCustomRewardsService;
    twitchGateway: TwitchGateway;
    twitchService: TwitchService;
  }

  interface CommandState {
    arena: string;
    first: string;
    isLive: boolean;
    limitedCommands: { [key: string]: { [key: string]: number } };
    toggledOffCommands: string[];
    killedCommands: string[];
    blunderBotPersonality: string;
    blunderbotVoice: string;
    ephemeralCommands: { [key: string]: string };
    cbanUsers: string[];
    wouldBeCommands: { [key: string]: string };
    contributions: {
      bits: { [key: string]: number };
      subs: { [key: string]: boolean };
      raids: { [key: string]: boolean };
    };
    heartRateHigh: number;
  }

  interface MessageCommand {
    aliases?: string[];
    hideFromList?: boolean;
    message: string;
  }
}
