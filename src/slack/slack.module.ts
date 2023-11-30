import { forwardRef, Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [forwardRef(() => OpenaiModule)],
  controllers: [],
  providers: [SlackService],
  exports: [SlackService]
})
export class SlackModule {}
