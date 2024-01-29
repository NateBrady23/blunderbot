import { Body, Controller, Post } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}
  @Post('/command')
  postOwnerRunCommand(@Body() body: CommandRequest) {
    void this.discordService.ownerRunCommand(body.command);
  }
}
