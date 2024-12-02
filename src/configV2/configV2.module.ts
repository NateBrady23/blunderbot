import { forwardRef, Module } from '@nestjs/common';
import { ConfigV2Service } from './configV2.service';
import { EntityModule } from '../models/entity.module';
import { ConfigV2Controller } from './configV2.controller';
import { TwitchModule } from '../twitch/twitch.module';
import { AppModule } from '../app.module';
import { BrowserModule } from '../browser/browser.module';
import { DiscordModule } from '../discord/discord.module';
import { GiphyModule } from '../giphy/giphy.module';
import { LichessModule } from '../lichess/lichess.module';
import { OpenaiModule } from '../openai/openai.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { CommandModule } from '../command/command.module';
import { BlueskyModule } from 'src/bluesky/bluesky.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => BrowserModule),
    forwardRef(() => CommandModule),
    forwardRef(() => ConfigV2Module),
    forwardRef(() => DiscordModule),
    EntityModule,
    forwardRef(() => GiphyModule),
    forwardRef(() => LichessModule),
    forwardRef(() => OpenaiModule),
    forwardRef(() => SpotifyModule),
    forwardRef(() => TwitchModule),
    forwardRef(() => BlueskyModule)
  ],
  controllers: [ConfigV2Controller],
  providers: [ConfigV2Service],
  exports: [ConfigV2Service]
})
export class ConfigV2Module {}
