import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CONFIG } from './config/config.service';
import * as fs from 'fs';
import * as https from 'https';
import express = require('express');
import { ExpressAdapter } from '@nestjs/platform-express';
import * as http from 'http';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({ origin: '*', methods: '*' });
  // await app.listen(CONFIG.get().port);
  const httpServer = http.createServer(server).listen(CONFIG.get().port);
  const httpsServer = https
    .createServer(
      {
        key: fs.readFileSync('./src/utils/dev-certs/localhost.key'),
        cert: fs.readFileSync('./src/utils/dev-certs/localhost.crt')
      },
      server
    )
    .listen(443);
  app.useWebSocketAdapter(new IoAdapter(httpsServer));
  await app.init();
}

bootstrap();
