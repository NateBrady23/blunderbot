import { Platform } from '../../enums';

const command: Command = {
  name: 'toggle',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState, services }) => {
    const command = services.commandService.findCommand(ctx.args[0]);
    const name = command.name;

    if (commandState.toggledOffCommands.includes(name)) {
      commandState.toggledOffCommands = commandState.toggledOffCommands.filter(
        (cmd) => cmd !== name
      );
      void ctx.botSpeak(`Enabled !${name} command`);
    } else {
      commandState.toggledOffCommands.push(ctx.args[0]);
      void ctx.botSpeak(`Disabled !${name} command`);
    }
    return true;
  }
};

export default command;
