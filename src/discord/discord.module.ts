import { forwardRef, Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { OpenaiModule } from '../openai/openai.module';
import { CommandModule } from '../command/command.module';
import { DiscordController } from './discord.controller';
import { ConfigV2Module } from '../configV2/configV2.module';

@Module({
  imports: [
    forwardRef(() => CommandModule),
    forwardRef(() => ConfigV2Module),
    forwardRef(() => OpenaiModule)
  ],
  controllers: [DiscordController],
  providers: [DiscordService],
  exports: [DiscordService]
})
export class DiscordModule {}
