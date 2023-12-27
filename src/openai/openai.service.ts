/**
 * TODO: All of this goes in favor of the new assistance API
 */
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import OpenAI from 'openai';
import { CommandService } from '../command/command.service';
const fs = require('fs');
import { generateUUID, playAudioFile } from '../utils/utils';

const openai = new OpenAI({
  apiKey: CONFIG.openai.apiKey
});

export const baseMessages: any = [
  {
    role: 'system',
    content: CONFIG.openai.baseSystemMessage
  }
];

@Injectable()
export class OpenaiService {
  private logger: Logger = new Logger(OpenaiService.name);

  constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: CommandService
  ) {
    //
  }

  async tts(message: string, voice: any): Promise<void> {
    try {
      const response = await openai.audio.speech.create({
        model: CONFIG.openai.ttsModel,
        voice,
        input: message
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      const uuid = generateUUID();
      await fs.writeFileSync(`./temp/${uuid}.mp3`, buffer);
      await playAudioFile(`./temp/${uuid}.mp3`);
      this.logger.log(`Audio content written to file: /temp/${uuid}.mp3`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async translate(message: string): Promise<string> {
    try {
      const messages: any = [
        {
          role: 'system',
          content:
            'translate the following user message into english. return the answer in the form of a json response like {"translation": "", "language": ""} with translation being the translation and language being the language translated from. don\'t say anything other than the json response'
        },
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: CONFIG.openai.chatModel,
        messages
      });
      console.log(completion.choices[0].message.content);
      return completion.choices[0].message.content;
    } catch (e) {
      this.logger.error(e);
      return `Translation service is unavailable.`;
    }
  }

  async sendPrompt(
    userMessage: string,
    opts?: {
      temp?: number;
      includeBlunderBotContext?: boolean;
      platform?: string;
      moderate?: boolean;
      usePersonality?: boolean;
    }
  ): Promise<string> {
    let messages: any = [{ role: 'user', content: userMessage }];
    let systemMessages: any = [];
    try {
      if (opts?.moderate) {
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
      if (opts?.includeBlunderBotContext) {
        systemMessages = [...baseMessages];
      }
      if (opts?.usePersonality) {
        const personality = (await this.commandService.getCommandState())
          .blunderBotPersonality;
        if (personality) {
          systemMessages.push({
            role: 'system',
            content: personality
          });
        }
      }
      if (opts?.platform === 'twitch') {
        systemMessages.push({
          role: 'system',
          content: `Limit your reply to the following prompt to 100 words or less.`
        });
      }

      messages = [...systemMessages, ...messages];
      const completion = await openai.chat.completions.create({
        model: CONFIG.openai.chatModel,
        messages,
        temperature: opts?.temp || 0.9
      });

      let reply = completion.choices[0].message.content;
      this.logger.log(`Reply before filter: ${reply}`);

      if (opts?.includeBlunderBotContext) {
        reply = this.cleanReplyAsBlunderBot(reply);
      }
      return reply;
    } catch (e) {
      this.logger.log(e);
      return `I'm sorry, I'm not feeling well. I need to take a break.`;
    }
  }

  async getReplyFromContext(ctx: Context, { services }) {
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
        platform: ctx.platform
      });
    }
  }

  cleanReplyAsBlunderBot(reply: string): string {
    if (
      reply.includes(`cannot comply`) ||
      reply.includes(`can't comply`) ||
      reply.includes(`I'm unable`) ||
      reply.includes(`I am unable`) ||
      reply.includes(`not able`) ||
      reply.includes(`not allowed`) ||
      reply.includes(`was not programmed`) ||
      reply.includes(`was programmed`) ||
      reply.includes(`instructed`)
    ) {
      reply = `I apologize. I don't know how to reply to that.`;
    }

    // Making sure the reply doesn't create another command
    reply = reply.replace(/!/g, '');
    return reply;
  }

  async isFlagged(message: string): Promise<boolean> {
    const moderation = await openai.moderations.create({
      model: CONFIG.openai.textModerationModel,
      input: message
    });
    return moderation.results[0].flagged;
  }
}
