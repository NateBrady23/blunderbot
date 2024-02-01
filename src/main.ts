import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import express = require('express');
import { ExpressAdapter } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { createServer } from 'https';
import * as http from 'http';
import { CONFIG } from './config/config.service';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({ origin: '*', methods: '*' });
  // await app.listen(CONFIG.get().port);
  http.createServer(server).listen(CONFIG.get().port);
  const httpsServer = createServer(
    {
      key: readFileSync('./src/utils/dev-certs/localhost.key'),
      cert: readFileSync('./src/utils/dev-certs/localhost.crt')
    },
    server
  ).listen(443);

  // app.useWebSocketAdapter(new IoAdapter(httpServer));
  app.useWebSocketAdapter(new IoAdapter(httpsServer));
  await app.init();
}

void bootstrap();
