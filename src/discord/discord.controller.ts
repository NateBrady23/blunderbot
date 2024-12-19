import { Body, Controller, Post } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  public constructor(private readonly discordService: DiscordService) {}

  @Post('/command')
  public postOwnerRunCommand(@Body() body: CommandRequest): void {
    this.discordService.ownerRunCommand(body.command);
  }
}
