import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfigV2Service } from './configV2.service';

@Controller('config')
export class ConfigV2Controller {
  public constructor(private readonly configV2Service: ConfigV2Service) {}

  private generateResponse(
    config: Partial<UserConfigV2>,
    path: string
  ): Partial<UserConfigV2> {
    let response = config[path as keyof Partial<UserConfigV2>] || {};
    if (path === 'trivia' && !config.trivia?.length) {
      response = [];
    }
    return response;
  }

  @Get(':path')
  public async getConfig(
    @Param('path') path: ConfigV2Keys
  ): Promise<Partial<UserConfigV2>> {
    const config = await this.configV2Service.getLatest();
    return this.generateResponse(config, path);
  }

  @Post(':path')
  public async postConfig(
    @Param('path') path: ConfigV2Keys,
    @Body() body: Partial<UserConfigV2>
  ): Promise<Partial<UserConfigV2>> {
    const config = await this.configV2Service.update(
      path,
      body as JSON & number & Date
    );
    return this.generateResponse(config, path);
  }
}
