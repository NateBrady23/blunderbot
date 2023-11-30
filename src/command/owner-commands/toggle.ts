import { Platform } from '../../enums';

const command: Command = {
  name: 'toggle',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    if (commandState.toggledOffCommands.includes(ctx.args[0])) {
      commandState.toggledOffCommands = commandState.toggledOffCommands.filter(
        (cmd) => cmd !== ctx.args[0]
      );
      ctx.botSpeak(`Enabled !${ctx.args[0]} command`);
    } else {
      commandState.toggledOffCommands.push(ctx.args[0]);
      ctx.botSpeak(`Disabled !${ctx.args[0]} command`);
    }
    return true;
  }
};

export default command;
