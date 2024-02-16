// import * as yaml from 'js-yaml';
import { getRandomElement } from '../utils/utils';
import * as path from 'path';

class ConfigService {
  loadedConfig: Partial<Config> = {};
  constructor() {
    this.loadConfig();
  }

  loadFromFile(configKey: string, filePath: string) {
    try {
      // @ts-expect-error: Dynamically load the config file
      this.loadedConfig[configKey] = require(
        path.join(__dirname, filePath)
      ).default;
    } catch (e) {
      console.log(`No config file: ${filePath} [skipping]`);
    }
  }

  loadConfig() {
    this.loadedConfig = require(path.join(__dirname, './config')).default;

    // If either of these fail, that's fatal
    this.loadedConfig.twitch = require(
      path.join(__dirname, './config.twitch')
    ).default;

    // These are optional and can fail to load
    this.loadFromFile('autoCommands', './config.auto-commands');
    this.loadFromFile('autoResponder', './config.auto-responder');
    this.loadFromFile('bits', './config.bits');
    this.loadFromFile('db', './config.db');
    this.loadFromFile('gif', './config.gif');
    this.loadFromFile('messageCommands', './config.message-commands');
    this.loadFromFile('raids', './config.raids');
    this.loadFromFile('twitter', './config.twitter');

    // Load the public files
    console.log('Config loaded');
  }

  public get() {
    return this.loadedConfig;
  }

  public getRandomRapidApiKey() {
    return getRandomElement(CONFIG.get().rapidApi?.keys);
  }
}

const CONFIG = new ConfigService();

export { CONFIG };
