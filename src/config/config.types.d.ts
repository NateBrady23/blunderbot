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

interface UserSoundsConfig {
  mute: {
    programs: string[];
  };
  unmute: {
    programs: string[];
  };
}

type UserAutoCommandsConfig = {
  commands: string[];
}[];

type UserKilledCommandsConfig = string[];
type UserHiddenCommandsConfig = string[];

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

interface UserConfig {
  port: number;
  wsPort: number;
  nickname: string;
  commandsListUrl: string;

  twitch: UserTwitchConfig;
  db: UserDbConfig;
  decapi: UserDecapiConfig;
  heartRate: UserHeartRateConfig;
  giphy: UserGiphyConfig;
  rapidApi: UserRapidApiConfig;
  sounds: UserSoundsConfig;
  autoCommands: UserAutoCommandsConfig;
  killedCommands: UserKilledCommandsConfig;
  hiddenCommands: UserHiddenCommandsConfig;
  raids: UserRaidsConfig;
  bits: UserBitsConfig;
  gif: UserGifConfig;
  autoResponder: UserAutoResponderConfig;
  trivia: UserTriviaConfig;
}

interface Config extends UserConfig {}
