import { Module } from '@nestjs/common';
import { LichessService } from './lichess.service';

@Module({
  imports: [],
  controllers: [],
  providers: [LichessService],
  exports: [LichessService]
})
export class LichessModule {}
