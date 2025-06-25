import { forwardRef, Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';
import { ConfigV2Module } from '../configV2/configV2.module';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [forwardRef(() => ConfigV2Module), forwardRef(() => OpenaiModule)],
  controllers: [SpotifyController],
  providers: [SpotifyService],
  exports: [SpotifyService]
})
export class SpotifyModule {}
