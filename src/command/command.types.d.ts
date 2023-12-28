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
  appGateway: any;
  browserService: any;
  discordService: any;
  giphyService: any;
  lichessService: any;
  openaiService: any;
  twitchCustomRewardsService: any;
  twitchGateway: any;
  twitchService: any;
}

interface CommandState {
  arena: string;
  first: string;
  isLive: boolean;
  limitedCommands: any;
  toggledOffCommands: string[];
  killedCommands: string[];
  blunderBotPersonality: string;
  blunderbotVoice: string;
  ephemeralCommands: any;
  cbanUsers: string[];
  wouldBeCommands: any;
  contributions: any;
  heartRateHigh: number;
}

interface MessageCommand {
  aliases?: string[];
  hideFromList?: boolean;
  message: string;
}
