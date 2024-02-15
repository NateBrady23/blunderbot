interface UserTwitchConfig {
  onSubscribe: string[];
  challengeRewardId?: string;
  welcome: {
    enabled: boolean;
    message: string;
    ignoreUsers: string[];
  };
  maxMessageLength?: number;
  eventWebsocketUrl: string;
  eventSubscriptionUrl: string;
}

interface UserTwitterConfig {
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
  tweetImagesEnabled: boolean;
  tweetHashtags: string;
  announceLive: boolean;
}

interface UserDbConfig {
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

interface UserDecapiConfig {
  enabled: boolean;
  token: string;
}

interface UserHeartRateConfig {
  enabled: boolean;
  url: string;
  class: string;
}

interface UserGiphyConfig {
  enabled: boolean;
  apiKey: string;
}

interface UserRapidApiConfig {
  enabled: boolean;
  keys: string[];
}

interface UserYoutubeConfig {
  enabled: boolean;
  apiKey: string;
  shortsPlaylistId: string;
}

interface UserSoundsConfig {
  mute: {
    programs: string[];
  };
  unmute: {
    programs: string[];
  };
}

type UserTitledPlayersConfig = [string, string][];

type UserAutoCommandsConfig = {
  commands: string[];
}[];

type UserKilledCommandsConfig = string[];
type UserHiddenCommandsConfig = string[];
interface UserMessageCommandsConfig {
  [command: string]: any;
}

interface UserRaidsConfig {
  alert: string;
  announcement: string;
  defaultCommands: string[];
  matches: {
    [key: string]: {
      commands: string[];
      alert?: string;
    };
  };
}

interface UserBitsConfig {
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
}

interface UserGifConfig {
  matches: {
    [key: string]: string;
  };
  notFound: string;
}

type UserAutoResponderConfig = {
  phrases: string[];
  responses: string[];
}[];

type UserTriviaConfig = {
  question: string;
  answers: number | string[];
  points: number;
  closestTo?: boolean;
  timeLimit?: number;
}[];

interface UserConfig {
  port: number;
  wsPort: number;
  nickname: string;
  commandsListUrl: string;

  twitch: UserTwitchConfig;
  twitter: UserTwitterConfig;
  db: UserDbConfig;
  decapi: UserDecapiConfig;
  heartRate: UserHeartRateConfig;
  giphy: UserGiphyConfig;
  rapidApi: UserRapidApiConfig;
  youtube: UserYoutubeConfig;
  sounds: UserSoundsConfig;
  titledPlayers: UserTitledPlayersConfig;
  autoCommands: UserAutoCommandsConfig;
  killedCommands: UserKilledCommandsConfig;
  hiddenCommands: UserHiddenCommandsConfig;
  messageCommands: UserMessageCommandsConfig;
  raids: UserRaidsConfig;
  bits: UserBitsConfig;
  gif: UserGifConfig;
  autoResponder: UserAutoResponderConfig;
  trivia: UserTriviaConfig;
}

interface Config extends UserConfig {
  kings: string[];
  crowns: string[];
  oppKings: string[];
  themeConfig: any;
  soundboard: string[];
  cursors: string[];
  commands: { [key: string]: Command };
}
