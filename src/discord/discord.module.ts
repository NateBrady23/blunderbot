import { forwardRef, Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { OpenaiModule } from '../openai/openai.module';
import { CommandModule } from '../command/command.module';
import { DiscordController } from './discord.controller';

@Module({
  imports: [forwardRef(() => CommandModule), OpenaiModule],
  controllers: [DiscordController],
  providers: [DiscordService],
  exports: [DiscordService]
})
export class DiscordModule {}
