import { Body, Controller, Get, Post } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { configService, CONFIG } from '../config/config.service';

@Controller('twitch')
export class TwitchController {
  constructor(private readonly twitchService: TwitchService) {}

  @Get('kings')
  getTwitchKings(): string[] {
    return configService.getKings();
  }

  @Get('opps')
  getOpponentKings(): string[] {
    return configService.getOppKings();
  }

  @Get('crowns')
  getTwitchCrowns(): string[] {
    return configService.getCrowns();
  }

  @Get('themeconfig')
  getThemeConfig(): unknown {
    return configService.getThemeConfig();
  }

  // Load sounds for the soundboard menu
  @Get('soundboard')
  getSoundboard(): string[] {
    return configService.getSoundboard();
  }

  @Get('titles')
  getTitles(): string[][] {
    return CONFIG.titledPlayers;
  }

  @Post('/command')
  postOwnerRunCommand(@Body() body: { command: string }) {
    void this.twitchService.ownerRunCommand(body.command);
  }

  @Post('/force-clients-refresh')
  forceClientsRefresh() {
    void this.twitchService.tellAllConnectedClientsToRefresh();
  }
}
