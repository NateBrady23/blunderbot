import { Platform } from '../../enums';

const command: Command = {
  name: 'voice',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState, services }) => {
    if (!services.configV2Service.get().openai?.enabled) {
      console.log('OpenAI is disabled in !voice.');
      return false;
    }
    const voice: OpenAiVoiceOptions = <OpenAiVoiceOptions>(
      ctx.args[0]?.toLowerCase().trim()
    );
    if (
      !voice ||
      !services.configV2Service.get().openai?.voices?.includes(voice)
    ) {
      return false;
    }
    commandState.blunderbotVoice = voice;
    return true;
  }
};

export default command;
