import { Module } from '@nestjs/common';
import { GiphyService } from './giphy.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GiphyService],
  exports: [GiphyService]
})
export class GiphyModule {}
