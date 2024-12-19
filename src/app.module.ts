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
import { SpotifyModule } from './spotify/spotify.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as TypeOrmNamingStrategy from 'typeorm-naming-strategies';
import { CONFIG } from './config/config.service';
import { ConfigV2Module } from './configV2/configV2.module';
import { BlueskyModule } from './bluesky/bluesky.module';

const imports = [
  BrowserModule,
  ConfigV2Module,
  DiscordModule,
  OpenaiModule,
  SpotifyModule,
  TwitchModule,
  BlueskyModule,
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public')
  })
];

if (CONFIG.get().db.enabled) {
  const srcOrDist = __filename.endsWith('.ts') ? 'src' : 'dist';

  const typeOrmModule = TypeOrmModule.forRoot({
    type: CONFIG.get().db.type,
    host: CONFIG.get().db.host,
    port: CONFIG.get().db.port,
    username: CONFIG.get().db.username,
    password: CONFIG.get().db.password,
    database: CONFIG.get().db.database,
    entities: [`${srcOrDist}/models/**/*.entity{.ts,.js}`],
    migrationsRun: CONFIG.get().db.migrationsRun,
    migrationsTableName: 'migrations',
    migrations: [`${srcOrDist}/migrations/*{.ts,.js}`],
    logging: ['error'],
    connectTimeout: 60 * 1000,
    namingStrategy: new TypeOrmNamingStrategy.SnakeNamingStrategy(),
    extra: CONFIG.get().db.extra
  });

  imports.push(typeOrmModule);
}

@Module({
  imports,
  controllers: [AppController],
  providers: [AppService, AppGateway],
  exports: [AppGateway]
})
export class AppModule {}
