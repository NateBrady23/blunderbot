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

    this.loadFromFile('gif', './config.gif');

    // Load the public files
    console.log('Config loaded');
  }

  public get() {
    return this.loadedConfig;
  }
}

const CONFIG = new ConfigService();

export { CONFIG };
