import { Body, Controller, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  public constructor(private readonly openaiService: OpenaiService) {}

  @Post('/translate')
  public translate(@Body() body: TranslationRequest): Promise<string> {
    return this.openaiService.translate(body.message);
  }
}
