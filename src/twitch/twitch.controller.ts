import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Post
} from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { ConfigV2Service } from '../configV2/configV2.service';

@Controller('twitch')
export class TwitchController {
  constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: ConfigV2Service,
    private readonly twitchService: TwitchService
  ) {}

  @Get('kings')
  getTwitchKings(): string[] {
    return this.configV2Service.get().kings;
  }

  @Get('opps')
  getOpponentKings(): string[] {
    return this.configV2Service.get().oppKings;
  }

  @Get('crowns')
  getTwitchCrowns(): string[] {
    return this.configV2Service.get().crowns;
  }

  @Get('themeconfig')
  getThemeConfig(): unknown {
    return this.configV2Service.get().themeConfig;
  }

  // Load sounds for the soundboard menu
  @Get('soundboard')
  getSoundboard(): string[] {
    return this.configV2Service.get().soundboard;
  }

  @Get('titles')
  getTitles(): string[][] {
    return this.configV2Service.get().lichess.titledPlayers;
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
