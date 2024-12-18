interface UserTwitchConfigV2 {
  // Twitch API Config
  ownerUsername: string;
  ownerId: string;
  botUsername: string;
  botId: string;
  apiOwnerOauthToken: string;
  apiBotOauthToken: string;
  apiClientId: string;
  apiClientSecret: string;

  // Custom Rewards Commands
  challengeRewardId?: string;
  customRewardCommands: { [key: string]: string[] };

  // Command Restrictions
  followerCommands?: string[];
  subCommands?: string[];
  vipCommands?: string[];
  hypeTrainConductorCommands?: string[];
  founderCommands?: string[];
  limitedCommands?: { [key: string]: number };
  userRestrictedCommands?: {
    [key: string]: string[];
  };

  // Auto Shoutouts
  autoShoutouts: string[];

  autoCommands: UserAutoCommandsConfigV2;

  // Auto Responder
  autoResponder: {
    phrases: string[];
    responses: string[];
  }[];

  // Raids Config
  raids: {
    matches: {
      [key: string]: {
        commands: string[];
      };
    };
  };

  // Bits Config
  bits: {
    matches: {
      [key: string]: {
        commands: string[];
      };
    };
  };

  // Uncategorized
  onSubscribe: string[];
  welcome: {
    message: string;
    ignoreUsers: string[];
  };
  maxMessageLength?: number;
  eventWebsocketUrl: string;
  eventSubscriptionUrl: string;
  kingsGalleryUrl: string;
  opponentsGalleryUrl: string;
}

interface UserLichessConfigV2 {
  user: string;
  oauthToken: string;
  teamId: string;
  teamName: string;

  titledPlayers: [string, string][];
}

interface UserCommandConfigV2 {
  killedCommands: UserKilledCommandsConfigV2;
  hiddenCommands: UserHiddenCommandsConfigV2;
  simpleCommands: UserSimpleCommandsConfigV2;
}

interface UserOpenAiConfigV2 {
  enabled: boolean;
  apiKey: string;
  chatModel: string;
  imageModel: string;
  ttsModel: string;
  textModerationModel: string;
  embeddingsModel: string;
  baseSystemMessage: string;
  imageEdits: string[];
  voices: string[];
  pronunciations: string[][];
  memoryCount: number;
}

interface UserSpotifyConfigV2 {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  maxAllowedSongLengthMs: number;
  allowExplicit: boolean;
}

interface UserBlueskyConfigV2 {
  enabled: boolean;
  username: string;
  password: string;
  imagesEnabled: boolean;
  hashtags: string;
  announceLive: boolean;
}

interface UserDbConfigV2 {
  enabled: boolean;
  type: 'postgres' | 'mysql' | 'sqlite';
  host: string;
  port?: number;
  username: string;
  password: string;
  database: string;
  migrationsRun: boolean;
  extra?: {
    ssl?: {
      rejectUnauthorized: boolean;
    };
  };
}

interface UserDiscordConfigV2 {
  enabled: boolean;
  botToken: string;
  announcementChannelId: string;
  galleryChannelId: string;
  musicChannelId?: string;
  generalChannelId: string;
  modChannelId: string;
  ownerAuthorId: string;
  botAuthorId: string;
  inviteLink: string;
}

interface UserYoutubeConfigV2 {
  enabled: boolean;
  apiKey: string;
  shortsPlaylistId: string;
}

interface UserSoundsConfigV2 {
  mute: {
    programs: string[];
  };
  unmute: {
    programs: string[];
  };
}

type UserAutoCommandsConfigV2 = {
  timeBetweenSeconds: number;
  commandSets: [string[]];
};

type UserKilledCommandsConfigV2 = string[];
type UserHiddenCommandsConfigV2 = string[];
interface UserSimpleCommandsConfigV2 {
  [command: string]: unknown;
}

type UserTriviaConfigV2 = {
  question: string;
  answers: string[];
  points: number;
  closestTo?: boolean;
  timeLimit?: number;
}[];

interface UserMiscConfigV2 {
  decapiToken: string;
  hypeRateEnabled: boolean;
  hypeRateUrl: string;
  giphyApiKey: string;
  rapidApiKey: string;
  sounds: UserSoundsConfigV2;
  commandsListUrl: string;
}

interface UserConfigV2 {
  // Needed for BlunderBot (server) to start properly
  port: number;
  wsPort: number;
  nickname: string;
  db: UserDbConfigV2;

  twitch: UserTwitchConfigV2;
  lichess: UserLichessConfigV2;

  // Commands section on BlunderBot-Admin (platform agnostic)
  commandConfig: UserCommandConfigV2;

  discord: UserDiscordConfigV2;
  openai: UserOpenAiConfigV2;
  spotify: UserSpotifyConfigV2;
  bluesky: UserBlueskyConfigV2;
  youtube: UserYoutubeConfigV2;
  trivia: UserTriviaConfigV2;
  misc: UserMiscConfigV2;
}

interface ConfigV2 extends UserConfigV2 {
  gifs: string[];
  kings: string[];
  crowns: string[];
  oppKings: string[];
  themeConfig: {
    [theme: string]: {
      boardExists?: boolean;
      [dir: string]:
        | {
            [fileName: string]: true;
          }
        | boolean
        | undefined;
    };
  };
  soundboard: string[];
  cursors: string[];
  commands: { [key: string]: Command };
}

type ConfigV2Keys =
  | 'twitch'
  | 'lichess'
  | 'commandConfig'
  | 'openai'
  | 'discord'
  | 'spotify'
  | 'bluesky'
  | 'trivia'
  | 'youtube';
