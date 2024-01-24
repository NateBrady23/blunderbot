interface UserTwitchConfig {
  ownerUsername: string;
  channel: string;
  ownerId: string;
  botId: string;
  botUsername: string;
  botPassword: string;
  apiBotOauthToken: string;
  apiOwnerOauthToken: string;
  apiClientId: string;
  apiClientSecret: string;
  onSubscribe: string[];
  customRewardCommands: { [key: string]: string[] };
  followerCommands: string[];
  subCommands: string[];
  limitedCommands: { [key: string]: number };
  userRestrictedCommands: {
    [key: string]: string[];
  };
  welcome: {
    enabled: boolean;
    message: string;
    ignoreUsers: string[];
  };
  eventWebsocketUrl: string;
  eventSubscriptionUrl: string;
}

interface UserLichessConfig {
  user: string;
  oauthToken: string;
  botOauthToken: string;
  teamId: string;
  teamName: string;
}

interface UserOpenAiConfig {
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

interface UserDiscordConfig {
  enabled: boolean;
  botToken: string;
  announcementChannelId: string;
  galleryChannelId: string;
  generalChannelId: string;
  modChannelId: string;
  ownerAuthorId: string;
  botAuthorId: string;
  inviteLink: string;
}

interface UserSlackConfig {
  enabled: boolean;
  appToken: string;
  botToken: string;
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

type UserAutoShoutoutsConfig = string[];
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
  answers: string[];
  points: number;
}[];

interface UserConfig {
  port: number;
  nickname: string;
  commandsListUrl: string;

  twitch: UserTwitchConfig;
  lichess: UserLichessConfig;
  openai: UserOpenAiConfig;
  twitter: UserTwitterConfig;
  discord: UserDiscordConfig;
  slack: UserSlackConfig;
  decapi: UserDecapiConfig;
  heartRate: UserHeartRateConfig;
  giphy: UserGiphyConfig;
  rapidApi: UserRapidApiConfig;
  youtube: UserYoutubeConfig;
  sounds: UserSoundsConfig;
  autoShoutouts: UserAutoShoutoutsConfig;
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
