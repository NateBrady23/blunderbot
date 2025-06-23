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

const dbConfig = CONFIG.get().db;
if (dbConfig?.enabled) {
  const srcOrDist = __filename.endsWith('.ts') ? 'src' : 'dist';

  const typeOrmModule = TypeOrmModule.forRoot({
    type: dbConfig.type,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: [`${srcOrDist}/models/**/*.entity{.ts,.js}`],
    migrationsRun: dbConfig.migrationsRun,
    migrationsTableName: 'migrations',
    migrations: [`${srcOrDist}/migrations/*{.ts,.js}`],
    logging: ['error'],
    connectTimeout: 60 * 1000,
    namingStrategy: new TypeOrmNamingStrategy.SnakeNamingStrategy(),
    extra: dbConfig.extra
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
