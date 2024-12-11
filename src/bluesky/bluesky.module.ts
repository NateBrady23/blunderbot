import { forwardRef, Module } from '@nestjs/common';
import { BlueskyService } from './bluesky.service';
import { OpenaiModule } from '../openai/openai.module';
import { ConfigV2Module } from '../configV2/configV2.module';

@Module({
  imports: [forwardRef(() => ConfigV2Module), forwardRef(() => OpenaiModule)],
  controllers: [],
  providers: [BlueskyService],
  exports: [BlueskyService]
})
export class BlueskyModule {}
