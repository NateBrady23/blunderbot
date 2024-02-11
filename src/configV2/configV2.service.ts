import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConfigV2Service {
  private logger: Logger = new Logger(ConfigV2Service.name);

  constructor() {
    //
    this.logger.log('ConfigV2Service instantiated');
  }
}
