import { Body, Controller, Get, Post } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { configService, ENV } from '../config/config.service';

@Controller('twitch')
export class TwitchController {
  constructor(private readonly twitchService: TwitchService) {}
  @Get('config')
  getTwitchConfig(): any {
    return {};
  }

  @Get('kings')
  getTwitchKings(): any {
    return configService.getKings();
  }

  @Get('opps')
  getOpponentKings(): any {
    return configService.getOppKings();
  }

  @Get('crowns')
  getTwitchCrowns(): any {
    return configService.getCrowns();
  }

  @Get('themeconfig')
  getThemeConfig(): any {
    return configService.getThemeConfig();
  }

  // Load sounds for the soundboard menu
  @Get('soundboard')
  getSoundboard(): any {
    return configService.getSoundboard();
  }

  @Get('titles')
  getTitles(): string[][] {
    return ENV.TITLED_PLAYERS;
  }

  @Post('/command')
  postOwnerRunCommand(@Body() body) {
    void this.twitchService.ownerRunCommand(body.command);
  }

  @Post('/force-clients-refresh')
  forceClientsRefresh() {
    void this.twitchService.tellAllConnectedClientsToRefresh();
  }
}
