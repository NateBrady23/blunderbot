import { forwardRef, Module } from '@nestjs/common';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { TwitchGateway } from './twitch.gateway';
import { CommandModule } from '../command/command.module';
import { OpenaiModule } from '../openai/openai.module';
import { GiphyModule } from '../giphy/giphy.module';

@Module({
  imports: [
    forwardRef(() => CommandModule),
    forwardRef(() => OpenaiModule),
    GiphyModule
  ],
  controllers: [TwitchController],
  providers: [TwitchService, TwitchGateway],
  exports: [TwitchGateway, TwitchService]
})
export class TwitchModule {}
