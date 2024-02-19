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

type UserKilledCommandsConfig = string[];
type UserHiddenCommandsConfig = string[];

interface UserConfig {
  port: number;
  wsPort: number;
  nickname: string;
  commandsListUrl: string;

  db: UserDbConfig;
  decapi: UserDecapiConfig;
  heartRate: UserHeartRateConfig;
  giphy: UserGiphyConfig;
  rapidApi: UserRapidApiConfig;
  sounds: UserSoundsConfig;
  killedCommands: UserKilledCommandsConfig;
  hiddenCommands: UserHiddenCommandsConfig;
}

interface Config extends UserConfig {}
