import { Body, Controller, Get, Post } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { CONFIG } from '../config/config.service';

@Controller('twitch')
export class TwitchController {
  constructor(private readonly twitchService: TwitchService) {}

  @Get('kings')
  getTwitchKings(): string[] {
    return CONFIG.get().kings;
  }

  @Get('opps')
  getOpponentKings(): string[] {
    return CONFIG.get().oppKings;
  }

  @Get('crowns')
  getTwitchCrowns(): string[] {
    return CONFIG.get().crowns;
  }

  @Get('themeconfig')
  getThemeConfig(): unknown {
    return CONFIG.get().themeConfig;
  }

  // Load sounds for the soundboard menu
  @Get('soundboard')
  getSoundboard(): string[] {
    return CONFIG.get().soundboard;
  }

  @Get('titles')
  getTitles(): string[][] {
    return CONFIG.get().titledPlayers;
  }

  @Post('/command')
  postOwnerRunCommand(@Body() body: { command: string }) {
    void this.twitchService.ownerRunCommand(body.command);
  }

  @Post('/custom-reward')
  postCustomReward(@Body() body: { title: string; cost: number }) {
    void this.twitchService.createCustomReward(body);
  }

  @Post('/force-clients-refresh')
  forceClientsRefresh() {
    void this.twitchService.tellAllConnectedClientsToRefresh();
  }
}
