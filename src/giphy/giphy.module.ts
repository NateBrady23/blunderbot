import { forwardRef, Module } from '@nestjs/common';
import { GiphyService } from './giphy.service';
import { ConfigV2Module } from '../configV2/configV2.module';

@Module({
  imports: [forwardRef(() => ConfigV2Module)],
  controllers: [],
  providers: [GiphyService],
  exports: [GiphyService]
})
export class GiphyModule {}
