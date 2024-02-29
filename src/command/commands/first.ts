import { Platform } from '../../enums';

const command: Command = {
  name: 'first',
  aliases: ['1st', 'second', 'third', '3st'],
  help: 'The first in the chat to say !first is the first!',
  requiresLive: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    if (!commandState.first) {
      commandState.first = ctx.displayName;
    }
    void ctx.botSpeak(`@${commandState.first} is the first!`);
    return true;
  }
};

export default command;
