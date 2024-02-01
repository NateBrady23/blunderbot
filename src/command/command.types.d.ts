import { TwitchGateway } from '../twitch/twitch.gateway';
import { TwitchService } from '../twitch/twitch.service';
import { OpenaiService } from '../openai/openai.service';
import { LichessService } from '../lichess/lichess.service';
import { GiphyService } from '../giphy/giphy.service';
import { DiscordService } from '../discord/discord.service';
import { BrowserService } from '../browser/browser.service';
import { AppGateway } from '../app.gateway';
import { TwitterService } from '../twitter/twitter.service';
import { CommandService } from './command.service';
import { SpotifyService } from '../spotify/spotify.service';

declare global {
  interface CommandRunFuncOptions {
    services: CommandServices;
    commandState: CommandState;
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
    ownerRunCommands?: string[];
  }

  interface MessageCommand extends Command {
    message?: string;
    commands?: string[];
  }

  interface CommandServices {
    appGateway: AppGateway;
    browserService: BrowserService;
    commandService: CommandService;
    discordService: DiscordService;
    giphyService: GiphyService;
    lichessService: LichessService;
    openaiService: OpenaiService;
    spotifyService: SpotifyService;
    twitchGateway: TwitchGateway;
    twitchService: TwitchService;
    twitterService: TwitterService;
  }

  interface CommandState {
    arena: string;
    first: string;
    isLive: boolean;
    challengeQueue: {
      twitchUser: string;
      lichessUser: string;
    }[];
    limitedCommands: { [key: string]: { [key: string]: number } };
    toggledOffCommands: string[];
    killedCommands: string[];
    blunderBotPersonality: string;
    blunderbotVoice: OpenAiVoiceOptions;
    ephemeralCommands: { [key: string]: string };
    cbanUsers: string[];
    wouldBeCommands: { [key: string]: string };
    contributions: {
      bits: { [key: string]: number };
      subs: { [key: string]: boolean };
      raids: { [key: string]: boolean };
    };
    heartRateHigh: number;
    trivia: {
      fastestAnswer?: {
        user: string;
        seconds: number;
      };
      closestAnswer?: {
        user: string;
        difference: number;
        answer: string;
      };
      started: boolean;
      roundStartTime?: number;
      round: number;
      leaderboard: { [key: string]: number };
      answeredUsers: string[];
      roundAnswered?: boolean;
      roundEnded?: boolean;
      triviaTimeout?: NodeJS.Timeout;
    };
    spotify: {
      requests: { [key: string]: string };
    };
  }
}
