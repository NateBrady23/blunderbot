import { Platform } from '../../enums';

const command: Command = {
  name: 'personality',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { commandState }) => {
    if (ctx.isOwner && ctx.body) {
      commandState.blunderBotPersonality = ctx.body.trim();
    }
    if (commandState.blunderBotPersonality) {
      void ctx.botSpeak(
        `Someone set my chat personality to: ${commandState.blunderBotPersonality}`
      );
    } else {
      void ctx.botSpeak(`I don't have a chat personality set.`);
    }
    return true;
  }
};

export default command;
