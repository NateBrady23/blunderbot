import { config } from 'dotenv';
import { readdirSync } from 'fs';

config();

const kings = [];
const crowns = [];
const oppKings = [];
const themeConfig = {};
const soundboard = [];

[
  ['./public/images/kings', kings],
  ['./public/images/crowns', crowns],
  ['./public/images/opponents', oppKings],
  ['./public/sounds/soundboard', soundboard]
].forEach((publicFiles: [string, any]) => {
  readdirSync(publicFiles[0]).forEach((file) => {
    const fileName = file.split('.')[0];
    publicFiles[1].push(fileName);
  });
});

readdirSync('./public/images/themes').forEach((theme) => {
  themeConfig[theme] = {};

  readdirSync(`./public/images/themes/${theme}`).forEach((dir) => {
    if (dir === 'board.png') {
      themeConfig[theme].boardExists = true;
    } else {
      themeConfig[theme][dir] = {};
      readdirSync(`./public/images/themes/${theme}/${dir}`).forEach((file) => {
        const fileName = file.split('.')[0];
        themeConfig[theme][dir][fileName] = true;
      });
    }
  });
});

class ConfigService {
  private readonly shoutoutUsers: string[];
  private readonly titledPlayers: string[][];
  constructor(private env: { [k: string]: string | undefined }) {
    // So we only have to parse these on load
    const shoutoutUsers = this.getValue('SHOUTOUT_USERS');
    this.shoutoutUsers = shoutoutUsers.split(', ');

    this.titledPlayers = JSON.parse(this.getValue('TITLED_PLAYERS'));
  }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      console.log('Missing env var: ', key);
      throw new Error('config error - missing env.');
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getRandomRapidApiKey() {
    const api1 = this.getValue('RAPID_API_KEY_1');
    const api2 = this.getValue('RAPID_API_KEY_2');
    // return one of the api keys at random
    return Math.random() < 0.5 ? api1 : api2;
  }

  public getThemeConfig() {
    return themeConfig;
  }

  public getKings() {
    return kings;
  }

  public getOppKings() {
    return oppKings;
  }

  public getCrowns() {
    return crowns;
  }

  public getSoundboard() {
    return soundboard;
  }

  public getEnvVar(envVar: EnvironmentVariable): any {
    if (envVar === EnvironmentVariable.SHOUTOUT_USERS) {
      return this.shoutoutUsers;
    }

    if (envVar === EnvironmentVariable.TITLED_PLAYERS) {
      return this.titledPlayers;
    }

    const value = this.getValue(envVar);

    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }

    return value;
  }
}

enum EnvironmentVariable {
  PORT = 'PORT',
  // Chat Platforms
  DISCORD_ENABLED = 'DISCORD_ENABLED',
  DISCORD_BOT_TOKEN = 'DISCORD_BOT_TOKEN',
  DISCORD_ANNOUNCEMENT_CHANNEL = 'DISCORD_ANNOUNCEMENT_CHANNEL',
  DISCORD_GENERAL_CHANNEL = 'DISCORD_GENERAL_CHANNEL',
  DISCORD_MOD_CHANNEL = 'DISCORD_MOD_CHANNEL',
  DISCORD_OWNER_AUTHOR_ID = 'DISCORD_OWNER_AUTHOR_ID',
  DISCORD_BOT_AUTHOR_ID = 'DISCORD_BOT_AUTHOR_ID',
  DISCORD_INVITE_LINK = 'DISCORD_INVITE_LINK',
  SLACK_ENABLED = 'SLACK_ENABLED',
  SLACK_APP_TOKEN = 'SLACK_APP_TOKEN',
  SLACK_BOT_TOKEN = 'SLACK_BOT_TOKEN',
  // AI
  OPENAI_API_KEY = 'OPENAI_API_KEY',
  OPENAI_TTS_MODEL = 'OPENAI_TTS_MODEL',
  OPENAI_CHAT_MODEL = 'OPENAI_CHAT_MODEL',
  OPENAI_BASE_SYSTEM_MESSAGE = 'OPENAI_BASE_SYSTEM_MESSAGE',
  OPENAI_TEXT_MODERATION_MODEL = 'OPENAI_TEXT_MODERATION_MODEL',
  // Lichess
  LICHESS_OAUTH_TOKEN = 'LICHESS_OAUTH_TOKEN',
  LICHESS_TEAM_ID = 'LICHESS_TEAM_ID',
  LICHESS_USER = 'LICHESS_USER',
  LICHESS_TEAM_NAME = 'LICHESS_TEAM_NAME',
  // Twitch
  TWITCH_API_CLIENT_ID = 'TWITCH_API_CLIENT_ID',
  TWITCH_API_BOT_OAUTH_TOKEN = 'TWITCH_API_BOT_OAUTH_TOKEN',
  TWITCH_API_OWNER_OAUTH_TOKEN = 'TWITCH_API_OWNER_OAUTH_TOKEN',
  TWITCH_BOT_USERNAME = 'TWITCH_BOT_USERNAME',
  TWITCH_BOT_PASSWORD = 'TWITCH_BOT_PASSWORD',
  TWITCH_OWNER_USERNAME = 'TWITCH_OWNER_USERNAME',
  TWITCH_OWNER_ID = 'TWITCH_OWNER_ID',
  TWITCH_BOT_ID = 'TWITCH_BOT_ID',
  TWITCH_CHANNEL = 'TWITCH_CHANNEL',
  // Other APIs
  DECAPI_TOKEN = 'DECAPI_TOKEN',
  GIPHY_API_KEY = 'GIPHY_API_KEY',
  HEART_RATE_ENABLED = 'HEART_RATE_ENABLED',
  HEART_RATE_URL = 'HEART_RATE_URL',
  HEART_RATE_CLASS = 'HEART_RATE_CLASS',
  RAPID_API_KEY_1 = 'RAPID_API_KEY_1',
  RAPID_API_KEY_2 = 'RAPID_API_KEY_2',
  YOUTUBE_API_KEY = 'YOUTUBE_API_KEY',
  YOUTUBE_SHORTS_PLAYLIST_ID = 'YOUTUBE_SHORTS_PLAYLIST_ID',
  // Other
  COMMANDS_LIST_URL = 'COMMANDS_LIST_URL',
  SHOUTOUT_USERS = 'SHOUTOUT_USERS',
  TITLED_PLAYERS = 'TITLED_PLAYERS',
  WELCOMING_NON_FOLLOWERS_ENABLED = 'WELCOMING_NON_FOLLOWERS_ENABLED',
  WELCOME_MESSAGE = 'WELCOME_MESSAGE'
}

const configService = new ConfigService(process.env).ensureValues(
  Object.keys(EnvironmentVariable)
);

const ENV: Partial<Record<EnvironmentVariable, any>> = {};
Object.keys(EnvironmentVariable).map((key: EnvironmentVariable) => {
  ENV[key] = configService.getEnvVar(key);
});

export { configService, ENV };
