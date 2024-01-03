import { Platform } from '../../enums';

const command: Command = {
  name: 'help',
  aliases: ['commands'],
  help: "I've entered a never-ending loop! Self-destructing in 3... 2... 1...",
  platforms: [Platform.Twitch, Platform.Discord],
  run: (ctx, { commandState, services }) => {
    const commandName = ctx.args[0].toLowerCase();
    const cmd = services.commandService.findCommand(commandName);

    if (
      !cmd ||
      !cmd.help ||
      !cmd.platforms.includes(ctx.platform) ||
      commandState.killedCommands.includes(cmd.name)
    ) {
      ctx.botSpeak(`There is no help available for that command.`);
      return false;
    }
    ctx.botSpeak(cmd.help);
    return true;
  }
};

export default command;
