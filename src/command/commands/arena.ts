import { Platform } from '../../enums';

const command: Command = {
  name: 'arena',
  aliases: ['join'],
  help: 'Displays a link to the current arena.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { commandState }) => {
    let msg: string;
    if (ctx.args.length && ctx.isMod) {
      const arg = ctx.body ?? '';
      if (arg === 'clear') {
        msg = 'Arena link has been reset.';
        commandState.arena = '';
      } else {
        commandState.arena = arg;
        msg = `Arena link has been set to: ${commandState.arena}`;
      }
    } else {
      msg = commandState.arena
        ? `Tonight's arena is at: ${commandState.arena}`
        : `There is currently no arena event. If you're looking to challenge, use the !challenge command to see how.`;
    }

    void ctx.botSpeak(msg);
    return true;
  }
};

export default command;
