import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwitchModule } from './twitch/twitch.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DiscordModule } from './discord/discord.module';
import { OpenaiModule } from './openai/openai.module';
import { AppGateway } from './app.gateway';
import { BrowserModule } from './browser/browser.module';
import { TwitterModule } from './twitter/twitter.module';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [
    BrowserModule,
    DiscordModule,
    OpenaiModule,
    SpotifyModule,
    TwitchModule,
    TwitterModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    })
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
  exports: [AppGateway]
})
export class AppModule {}
