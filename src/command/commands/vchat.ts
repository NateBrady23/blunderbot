import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'vchat',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().openai?.enabled) {
      console.log(`OpenAI is not enabled in !vchat command.`);
      return false;
    }
    const reply = await services.openaiService.getReplyFromContext(ctx, {
      services
    });
    await services.twitchService.ownerRunCommand(`!tts ${reply}`);
    return true;
  }
};

export default command;
