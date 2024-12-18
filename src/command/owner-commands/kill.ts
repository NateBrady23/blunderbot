import { Platform } from '../../enums';

const command: Command = {
  name: 'kill',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState, services }) => {
    const cmd = services.commandService.findCommand(ctx.args[0]);

    if (commandState.killedCommands.includes(cmd.name)) {
      commandState.killedCommands = commandState.killedCommands.filter(
        (commandName) => commandName !== cmd.name
      );
      void ctx.botSpeak(`Bringing !${cmd.name} command back to life`);
    } else {
      commandState.killedCommands.push(cmd.name);
      void ctx.botSpeak(`Killed !${cmd.name} command`);
    }
    return true;
  }
};

export default command;
