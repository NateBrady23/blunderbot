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
  public constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>,
    private readonly twitchService: TwitchService
  ) {}

  @Get('kings')
  public getTwitchKings(): string[] {
    return this.configV2Service.get().kings;
  }

  @Get('opps')
  public getOpponentKings(): string[] {
    return this.configV2Service.get().oppKings;
  }

  @Get('crowns')
  public getTwitchCrowns(): string[] {
    return this.configV2Service.get().crowns;
  }

  @Get('themeconfig')
  public getThemeConfig(): unknown {
    return this.configV2Service.get().themeConfig;
  }

  // Load sounds for the soundboard menu
  @Get('soundboard')
  public getSoundboard(): string[] {
    return this.configV2Service.get().soundboard;
  }

  @Get('titles')
  public getTitles(): string[][] {
    return this.configV2Service.get().lichess.titledPlayers;
  }

  @Post('/command')
  public postOwnerRunCommand(@Body() body: { command: string }): void {
    void this.twitchService.ownerRunCommand(body.command);
  }

  @Post('/custom-reward')
  public postCustomReward(@Body() body: { title: string; cost: number }): void {
    void this.twitchService.createCustomReward(body);
  }

  @Post('/force-clients-refresh')
  public forceClientsRefresh(): void {
    void this.twitchService.tellAllConnectedClientsToRefresh();
  }
}
