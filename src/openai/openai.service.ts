import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { CommandService } from '../command/command.service';
import { generateUUID, playAudioFile } from '../utils/utils';
import { createReadStream, writeFileSync } from 'fs';
import { Platform } from '../enums';
import { ConfigV2Service } from '../configV2/configV2.service';
import { ImageGenerateParams } from 'openai/resources';

@Injectable()
export class OpenaiService {
  private logger: Logger = new Logger(OpenaiService.name);
  private savedMessages: OpenAiChatMessage[] = [];
  private openai: OpenAI;
  private baseMessages: OpenAiChatMessage[];

  public constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: WrapperType<CommandService>,
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>
  ) {}

  public init(): void {
    this.openai = new OpenAI({
      apiKey: this.configV2Service.get().openai.apiKey
    });

    this.baseMessages = [
      {
        role: 'system',
        content: this.configV2Service.get().openai.baseSystemMessage
      }
    ];

    void this.createEmbedding('testing');
  }

  public fixPronunciations(text: string): string {
    for (const [key, value] of this.configV2Service.get().openai
      .pronunciations) {
      text = text.replace(new RegExp(key, 'gi'), value);
    }

    return text;
  }

  public async createImage(
    prompt: string,
    opt?: {
      size: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    }
  ): Promise<string> {
    try {
      const generateBody: ImageGenerateParams = {
        model: this.configV2Service.get().openai.imageModel || 'dall-e-3',
        prompt,
        quality: 'standard',
        n: 1
      };
      if (opt.size) {
        generateBody.size = opt.size;
      }
      const response = await this.openai.images.generate(generateBody);
      return response.data[0].url;
    } catch (error) {
      this.logger.error('Error creating image');
      this.logger.error(error);
    }
  }

  public async editImage(maskImg: string, prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.edit({
        image: createReadStream(maskImg),
        // TODO: Currently does not accept model parameter
        // model: CONFIG.get().openai?.imageModel || 'dall-e-3',
        prompt,
        n: 1
      });
      return response.data[0].url;
    } catch (error) {
      this.logger.error('Error editing image');
      this.logger.error(error);
    }
  }

  public async createEmbedding(text: string): Promise<Array<number>> {
    try {
      const response = await this.openai.embeddings.create({
        model:
          this.configV2Service.get().openai.embeddingsModel ||
          'text-embedding-ada-002',
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Error creating embedding');
      this.logger.error(error);
    }
  }

  public async tts(
    message: string,
    voice: OpenAiVoiceOptions
  ): Promise<boolean> {
    try {
      if (await this.isFlagged(message)) {
        return false;
      }
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Moderation service is unavailable.');
      return false;
    }

    try {
      const response = await this.openai.audio.speech.create({
        model: this.configV2Service.get().openai.ttsModel,
        voice,
        input: message
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      const uuid = generateUUID();
      writeFileSync(`./temp/${uuid}.mp3`, buffer);
      await playAudioFile(`./temp/${uuid}.mp3`, this.configV2Service);
      this.logger.log(`Audio content written to file: /temp/${uuid}.mp3`);
      return true;
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async translate(message: string): Promise<string> {
    try {
      const messages: OpenAiChatMessage[] = [
        {
          role: 'system',
          content:
            'translate the following user message into english. return the answer in the form of a json response like {"translation": "", "language": ""} with translation being the translation and language being the language translated from. don\'t say anything other than the json response'
        },
        { role: 'user', content: message }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.configV2Service.get().openai.chatModel,
        messages
      });
      return completion.choices[0].message.content;
    } catch (e) {
      this.logger.error(e);
      return `Translation service is unavailable.`;
    }
  }

  public async sendPrompt(
    userMessage: string,
    opts?: {
      temp?: number;
      includeBlunderBotContext?: boolean;
      platform?: string;
      moderate?: boolean;
      usePersonality?: boolean;
      user?: string;
    }
  ): Promise<string> {
    let systemMessages: OpenAiChatMessage[] = [];
    try {
      if (opts.moderate) {
        try {
          const isFlagged = await this.isFlagged(userMessage);
          if (isFlagged) {
            return `Please refrain from saying such things. I'm sensitive and I'd like to stay that way.`;
          }
        } catch (e) {
          this.logger.error(e);
          this.logger.error('Moderation service is unavailable.');
          return "I'm sorry, I'm feeling a little dizzy right now.";
        }
      }

      if (opts.platform === Platform.Twitch) {
        userMessage += ' Only reply with 50 words or less.';
      } else {
        userMessage += ' Only reply with 200 words or less.';
      }

      if (opts.usePersonality) {
        const personality = (await this.commandService.getCommandState())
          .blunderBotPersonality;
        if (personality) {
          userMessage += ' Respond in this style: ' + personality;
        }
      }

      let messages: OpenAiChatMessage[] = [
        { role: 'user', content: userMessage }
      ];
      if (opts.includeBlunderBotContext) {
        systemMessages = [...this.baseMessages];
      }

      if (opts.user) {
        this.savedMessages.push({
          role: 'system',
          content: `The following message is from ${opts.user}.`
        });
      }

      this.savedMessages = [...this.savedMessages, ...messages];
      messages = [...systemMessages, ...this.savedMessages];
      const completion = await this.openai.chat.completions.create({
        model: this.configV2Service.get().openai.chatModel,
        messages,
        temperature: opts.temp || 0.9
      });

      let reply = completion.choices[0].message.content;
      this.logger.log(`Reply before filter: ${reply}`);

      if (opts.includeBlunderBotContext) {
        reply = this.cleanReplyAsBlunderBot(reply);
      }

      this.savedMessages.push({ role: 'assistant', content: reply });

      while (
        this.savedMessages.length >
          this.configV2Service.get().openai.memoryCount ||
        0
      ) {
        this.savedMessages.shift();
      }
      return reply;
    } catch (e) {
      this.logger.error(e);
      return `I'm sorry, I'm not feeling well. I need to take a break.`;
    }
  }

  public async getReplyFromContext(
    ctx: Context,
    services: CommandServices
  ): Promise<string> {
    let temp = 0.9;
    if (ctx.args[0]?.match(/!t.../i)) {
      temp = +ctx.args[0].replace('!t', '');
    }
    if (ctx.message) {
      const message = ctx.message.replace(/!chat |!t... /gi, '').trim();
      this.logger.log(`Message: ${message}`);

      return await services.openaiService.sendPrompt(message, {
        temp,
        moderate: true,
        usePersonality: true,
        includeBlunderBotContext: true,
        platform: ctx.platform,
        user: ctx.onBehalfOf || ctx.username
      });
    }
  }

  public async getChatCompletion(
    messages: OpenAiChatMessage[] | string,
    jsonResponse = false
  ): Promise<string> {
    if (typeof messages === 'string') {
      messages = [{ role: 'user', content: messages }];
    }
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configV2Service.get().openai.chatModel,
        messages,
        response_format: { type: jsonResponse ? 'json_object' : 'text' }
      });

      return completion.choices[0].message.content;
    } catch (e) {
      this.logger.error(e);
      return `I'm sorry, I'm not feeling well. I need to take a break.`;
    }
  }

  private cleanReplyAsBlunderBot(reply: string): string {
    if (
      reply.includes(`cannot comply`) ||
      reply.includes(`can't comply`) ||
      reply.includes(`I'm unable`) ||
      reply.includes(`I am unable`) ||
      reply.includes(`not able`) ||
      reply.includes(`not allowed`) ||
      reply.includes(`was not programmed`) ||
      reply.includes(`was programmed`)
    ) {
      reply = `I apologize. I don't know how to reply to that.`;
    }

    // Making sure the reply doesn't create another command
    reply = reply.replace(/!/g, '');
    return reply;
  }

  private async isFlagged(message: string): Promise<boolean> {
    const moderation = await this.openai.moderations.create({
      model: this.configV2Service.get().openai.textModerationModel,
      input: message
    });
    return moderation.results[0].flagged;
  }
}
