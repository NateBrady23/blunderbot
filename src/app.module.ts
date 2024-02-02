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
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntitySchema } from 'typeorm';
import * as TypeOrmNamingStrategy from 'typeorm-naming-strategies';
import { CONFIG } from './config/config.service';

const imports = [
  BrowserModule,
  DiscordModule,
  OpenaiModule,
  SpotifyModule,
  TwitchModule,
  TwitterModule,
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public')
  })
];

if (CONFIG.get().db?.enabled) {
  // src: https://github.com/typeorm/typeorm/issues/5676#issuecomment-772652004
  (DataSource.prototype as any).findMetadata = function (target: any) {
    return this.entityMetadatas.find((metadata: any) => {
      if (
        metadata.target === target ||
        (typeof metadata.target === 'function' &&
          typeof target === 'function' &&
          metadata.target.name === target.name)
      ) {
        return true;
      }

      if (target instanceof EntitySchema) {
        return metadata.name === target.options.name;
      }
      if (typeof target === 'string') {
        if (target.indexOf('.') !== -1) {
          return metadata.tablePath === target;
        } else {
          return metadata.name === target || metadata.tableName === target;
        }
      }

      return false;
    });
  };

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
    timeout: 60 * 1000,
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
