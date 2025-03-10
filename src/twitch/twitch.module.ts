import { forwardRef, Module } from '@nestjs/common';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { TwitchGateway } from './twitch.gateway';
import { CommandModule } from '../command/command.module';
import { OpenaiModule } from '../openai/openai.module';
import { GiphyModule } from '../giphy/giphy.module';
import { TwitchEventSub } from './twitch.eventsub';
import { ConfigV2Module } from '../configV2/configV2.module';

@Module({
  imports: [
    forwardRef(() => CommandModule),
    forwardRef(() => OpenaiModule),
    forwardRef(() => ConfigV2Module),
    GiphyModule
  ],
  controllers: [TwitchController],
  providers: [TwitchService, TwitchEventSub, TwitchGateway],
  exports: [TwitchService, TwitchGateway, TwitchService, TwitchEventSub]
})
export class TwitchModule {}
