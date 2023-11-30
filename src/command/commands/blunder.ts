import { Platform } from '../../enums';
import { ENV } from '../../config/config.service';

const command: Command = {
  name: 'blunder',
  aliases: ['commands'],
  help: 'Displays a list of available commands.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: (ctx, { commands }) => {
    const availableCommands = [];
    Object.keys(commands).forEach((commandName) => {
      const command = commands[commandName];
      if (
        !command.hideFromList &&
        // No platform is fine (messageCommands) otherwise check for platform match
        (!command.platforms || command.platforms.includes(ctx.platform)) &&
        !command.ownerOnly &&
        !command.modOnly
      ) {
        availableCommands.push(commandName);
      }
    });

    ctx.botSpeak(
      `The following commands are available: [${availableCommands.join(', ')}]`
    );
    ctx.botSpeak(
      `For a full list of commands, check out: ${ENV.COMMANDS_LIST_URL}`
    );
    return true;
  }
};

export default command;
