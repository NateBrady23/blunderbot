import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'voice',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    const voice = ctx.args[0]?.toLowerCase().trim();
    if (!voice || !CONFIG.openai.voices.includes(voice)) {
      return false;
    }
    commandState.blunderbotVoice = voice;
    return true;
  }
};

export default command;
