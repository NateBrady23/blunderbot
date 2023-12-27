import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'help',
  aliases: ['commands'],
  help: "I've entered a never-ending loop! Self-destructing in 3... 2... 1...",
  platforms: [Platform.Twitch, Platform.Discord],
  run: (ctx, { commands, commandState }) => {
    const commandName = ctx.args[0].toLowerCase();
    const cmd = commands[commandName];

    if (
      !cmd ||
      !cmd.help ||
      !cmd.platforms.includes(ctx.platform) ||
      CONFIG.killedCommands.includes(commandName) ||
      commandState.killedCommands.includes(commandName)
    ) {
      ctx.botSpeak(`There is no help available for that command.`);
      return false;
    }
    ctx.botSpeak(cmd.help);
    return true;
  }
};

export default command;
