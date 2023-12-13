import { Platform } from '../../enums';
import { YAML_CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'voice',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    const voice = ctx.args[0]?.toLowerCase().trim();
    if (!voice || !YAML_CONFIG.openaiConfig.voices.includes(voice)) {
      return false;
    }
    commandState.blunderbotVoice = voice;
    return true;
  }
};

export default command;
