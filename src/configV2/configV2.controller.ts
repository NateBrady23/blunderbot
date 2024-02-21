import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfigV2Service } from './configV2.service';

@Controller('config')
export class ConfigV2Controller {
  constructor(private readonly configV2Service: ConfigV2Service) {}

  generateResponse(config: any, path: string) {
    let response = (config?.[path] || {}) as Partial<UserConfigV2>;
    if (path === 'trivia' && !config.trivia?.length) {
      response = [] as Partial<UserConfigV2>;
    }
    return response;
  }

  @Get(':path')
  async getConfig(
    @Param('path') path: ConfigV2Keys
  ): Promise<Partial<UserConfigV2>> {
    const config = await this.configV2Service.getLatest();
    return this.generateResponse(config, path);
  }

  @Post(':path')
  async postConfig(
    @Param('path') path: ConfigV2Keys,
    @Body() body: Partial<UserConfigV2>
  ): Promise<Partial<UserConfigV2>> {
    const config = await this.configV2Service.update(path, body);
    return this.generateResponse(config, path);
  }
}
