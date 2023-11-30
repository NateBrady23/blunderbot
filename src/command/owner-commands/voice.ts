import { Platform } from '../../enums';

const command: Command = {
  name: 'voice',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    const voice = ctx.args[0]?.toLowerCase().trim();
    if (
      !voice ||
      !['onyx', 'alloy', 'echo', 'fable', 'nova', 'shimmer'].includes(voice)
    ) {
      return false;
    }
    commandState.blunderbotVoice = voice;
    return true;
  }
};

export default command;
