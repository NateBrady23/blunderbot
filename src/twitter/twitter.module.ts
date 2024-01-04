import { forwardRef, Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [forwardRef(() => OpenaiModule)],
  controllers: [],
  providers: [TwitterService],
  exports: [TwitterService]
})
export class TwitterModule {}
