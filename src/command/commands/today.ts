import { Platform } from '../../enums';

const command: Command = {
  name: 'today',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!services.configV2Service.get().openai.enabled) {
      console.log(`OpenAI is not enabled in !today command.`);
      return false;
    }
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
    const msg = await services.openaiService.sendPrompt(
      `!chat Today is ${formattedDate}. Give me a historical fact from a previous year on the same date. 40 words or less.`,
      {
        includeBlunderBotContext: true,
        usePersonality: true
      }
    );
    void ctx.botSpeak(msg);
    return true;
  }
};

export default command;
