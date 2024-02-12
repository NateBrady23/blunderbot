import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigV2Service } from './configV2.service';

@Controller('config')
export class ConfigV2Controller {
  constructor(private readonly configV2Service: ConfigV2Service) {}

  @Get('twitch')
  async getTwitchConfig(): Promise<any> {
    const config = await this.configV2Service.getLatest();
    return config?.twitch || {};
  }

  @Post('twitch')
  async postTwitchConfig(@Body() body: UserTwitchConfigV2): Promise<any> {
    const config = await this.configV2Service.update('twitch', body);
    return config?.twitch || {};
  }
}
