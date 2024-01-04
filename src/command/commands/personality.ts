import { Platform } from '../../enums';

const command: Command = {
  name: 'personality',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { commandState }) => {
    console.log('here');
    if (ctx.tags.owner && ctx.body) {
      commandState.blunderBotPersonality = ctx.body.trim();
    }
    if (commandState.blunderBotPersonality) {
      ctx.botSpeak(
        `Someone set my chat personality to: ${commandState.blunderBotPersonality}`
      );
    } else {
      ctx.botSpeak(`I don't have a chat personality set.`);
    }
    return true;
  }
};

export default command;
