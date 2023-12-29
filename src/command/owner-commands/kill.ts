import { Platform } from '../../enums';

const command: Command = {
  name: 'kill',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    if (commandState.killedCommands.includes(ctx.args[0])) {
      commandState.killedCommands = commandState.killedCommands.filter(
        (cmd) => cmd !== ctx.args[0]
      );
      ctx.botSpeak(`Bringing !${ctx.args[0]} command back to life`);
    } else {
      commandState.killedCommands.push(ctx.args[0]);
      ctx.botSpeak(`Killed !${ctx.args[0]} command`);
    }
    return true;
  }
};

export default command;
