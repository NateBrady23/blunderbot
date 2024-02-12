import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigEntityService } from '../models/config/config.service';
import { Config } from '../models/config/config.entity';

@Injectable()
export class ConfigV2Service {
  private logger: Logger = new Logger(ConfigV2Service.name);

  constructor(
    @Inject(forwardRef(() => ConfigEntityService))
    private readonly configEntityService: ConfigEntityService
  ) {
    //
    this.logger.log('ConfigV2Service instantiated');
  }

  async getLatest(): Promise<Config> {
    return ((await this.configEntityService.latest()) || {}) as Config;
  }

  async update(key: 'twitch', value: any): Promise<Config> {
    const config = await this.getLatest();
    // Always create a new config object to avoid updating the same object in the database
    // allowing for possible config rollback
    config.id = undefined;
    config[key] = value;
    return this.configEntityService.create(config);
  }
}
