/* eslint-disable @typescript-eslint/no-require-imports */
import * as path from 'path';

class ConfigService {
  private loadedConfig: Partial<UserConfig> = {};
  public constructor() {
    this.loadConfig();
  }

  public loadFromFile(
    configKey: 'port' | 'wsPort' | 'db',
    filePath: string
  ): void {
    try {
      this.loadedConfig[configKey] = require(
        path.join(__dirname, filePath)
      ).default;
    } catch {
      console.log(`No config file: ${filePath} [skipping]`);
    }
  }

  public loadConfig(): void {
    this.loadedConfig = require(path.join(__dirname, './config')).default;

    // Load the public files
    console.log('Config loaded');
  }

  public get(): Partial<UserConfig> {
    return this.loadedConfig;
  }
}

const CONFIG = new ConfigService();

export { CONFIG };
