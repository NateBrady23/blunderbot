import { forwardRef, Module } from '@nestjs/common';
import { TwitchModule } from '../twitch/twitch.module';
import { OpenaiModule } from '../openai/openai.module';
import { CommandService } from './command.service';
import { DiscordModule } from '../discord/discord.module';
import { GiphyModule } from '../giphy/giphy.module';
import { LichessModule } from '../lichess/lichess.module';
import { AppModule } from '../app.module';
import { BrowserModule } from '../browser/browser.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { EntityModule } from '../models/entity.module';
import { ConfigV2Module } from '../configV2/configV2.module';
import { BlueskyModule } from 'src/bluesky/bluesky.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => BrowserModule),
    forwardRef(() => ConfigV2Module),
    forwardRef(() => DiscordModule),
    forwardRef(() => TwitchModule),
    forwardRef(() => BlueskyModule),
    EntityModule,
    GiphyModule,
    LichessModule,
    OpenaiModule,
    SpotifyModule
  ],
  controllers: [],
  providers: [CommandService],
  exports: [CommandService]
})
export class CommandModule {}
