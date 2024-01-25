import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const availableCommands = [];

const command: Command = {
  name: 'blunder',
  aliases: ['commands'],
  help: 'Displays a list of available commands.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: (ctx, { commandState }) => {
    const commands = CONFIG.get().commands;
    Object.keys(commands).forEach((commandName) => {
      // Hide all message commands and hidden and killed commands
      if (
        Object.keys(CONFIG.get().messageCommands).includes(commandName) ||
        CONFIG.get().hiddenCommands.includes(commandName) ||
        CONFIG.get().killedCommands?.includes(commandName) ||
        commandState.killedCommands?.includes(commandName)
      ) {
        return;
      }

      const command = commands[commandName];

      if (
        // If we're on the right platform and it's not a mod or owner command
        command.platforms.includes(ctx.platform) &&
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
      `For a full list of commands, check out: ${CONFIG.get().commandsListUrl}`
    );
    return true;
  }
};

export default command;
