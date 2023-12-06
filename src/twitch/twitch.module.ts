import { forwardRef, Module } from '@nestjs/common';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { TwitchGateway } from './twitch.gateway';
import { CommandModule } from '../command/command.module';
import { OpenaiModule } from '../openai/openai.module';
import { GiphyModule } from '../giphy/giphy.module';
import { TwitchCustomRewardsService } from './twitch.custom-rewards';

@Module({
  imports: [
    forwardRef(() => CommandModule),
    forwardRef(() => OpenaiModule),
    GiphyModule
  ],
  controllers: [TwitchController],
  providers: [TwitchCustomRewardsService, TwitchService, TwitchGateway],
  exports: [TwitchCustomRewardsService, TwitchGateway, TwitchService]
})
export class TwitchModule {}
