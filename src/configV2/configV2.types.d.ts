interface UserTwitchConfigV2 {
  // Twitch API Config
  ownerUsername: string;
  channel: string;
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

  // Auto Responder
  autoResponder: {
    phrases: string[];
    responses: string[];
  }[];

  // Raids Config
  raids: {
    alert: string;
    announcement: string;
    defaultCommands: string[];
    matches: {
      [key: string]: {
        commands: string[];
        alert?: string;
      };
    };
  };

  // Bits Config
  bits: {
    matches: {
      [key: string]: {
        commands: string[];
        alert: string;
      };
    };
    '100orMore': {
      commands: string[];
      alert: string;
    };
    '99orLess': {
      commands: string[];
      alert: string;
    };
  };

  // Uncategorized
  onSubscribe: string[];
  welcome: {
    enabled: boolean;
    message: string;
    ignoreUsers: string[];
  };
  maxMessageLength?: number;
  eventWebsocketUrl: string;
  eventSubscriptionUrl: string;
}

interface UserLichessConfigV2 {
  user: string;
  oauthToken: string;
  teamId: string;
  teamName: string;

  titledPlayers: [string, string][];
}

interface UserCommandConfigV2 {}

interface UserOpenAiConfigV2 {
  enabled: boolean;
  apiKey: string;
  chatModel: string;
  imageModel: string;
  ttsModel: string;
  textModerationModel: string;
  baseSystemMessage: string;
  imageEdits: string[];
  voices: string[];
  pronunciations: [[string, string]];
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

interface UserTwitterConfigV2 {
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
  tweetImagesEnabled: boolean;
  tweetHashtags: string;
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

interface UserDecapiConfigV2 {
  enabled: boolean;
  token: string;
}

interface UserHeartRateConfigV2 {
  enabled: boolean;
  url: string;
  class: string;
}

interface UserGiphyConfigV2 {
  enabled: boolean;
  apiKey: string;
}

interface UserRapidApiConfigV2 {
  enabled: boolean;
  keys: string[];
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
  commands: string[];
}[];

type UserKilledCommandsConfigV2 = string[];
type UserHiddenCommandsConfigV2 = string[];
interface UserMessageCommandsConfigV2 {
  [command: string]: any;
}

interface UserGifConfigV2 {
  matches: {
    [key: string]: string;
  };
  notFound: string;
}

type UserTriviaConfigV2 = {
  question: string;
  answers: number | string[];
  points: number;
  closestTo?: boolean;
  timeLimit?: number;
}[];

interface UserConfigV2 {
  // Needed for BlunderBot (server) to start properly
  port: number;
  wsPort: number;
  nickname: string;
  db: UserDbConfigV2;

  twitch: UserTwitchConfigV2;
  lichess: UserLichessConfigV2;

  // Commands section on BlunderBot-Admin (platform agnostic)
  autoCommands: UserAutoCommandsConfigV2;
  killedCommands: UserKilledCommandsConfigV2;
  hiddenCommands: UserHiddenCommandsConfigV2;
  messageCommands: UserMessageCommandsConfigV2;

  discord: UserDiscordConfigV2;
  openai: UserOpenAiConfigV2;
  spotify: UserSpotifyConfigV2;
  twitter: UserTwitterConfigV2;
  youtube: UserYoutubeConfigV2;
  trivia: UserTriviaConfigV2;

  // Misc
  decapi: UserDecapiConfigV2;
  heartRate: UserHeartRateConfigV2;
  giphy: UserGiphyConfigV2;
  rapidApi: UserRapidApiConfigV2;
  sounds: UserSoundsConfigV2;
  commandsListUrl: string;
  gif: UserGifConfigV2;
}

interface ConfigV2 extends UserConfigV2 {
  kings: string[];
  crowns: string[];
  oppKings: string[];
  themeConfig: any;
  soundboard: string[];
  cursors: string[];
  commands: { [key: string]: Command };
}

type ConfigV2Keys =
  | 'twitch'
  | 'lichess'
  | 'openai'
  | 'discord'
  | 'spotify'
  | 'twitter'
  | 'trivia';
