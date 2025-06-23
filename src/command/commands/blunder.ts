import { Platform } from '../../enums';

const availableCommands: string[] = [];

const command: Command = {
  name: 'blunder',
  aliases: ['commands'],
  help: 'Displays a list of available commands.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: (ctx, { commandState, services }) => {
    const config = services.configV2Service.get();
    const commands = config?.commands;
    if (!commands) return true;

    Object.keys(commands).forEach((commandName) => {
      // Hide all simple commands and hidden and killed commands
      if (
        Object.keys(config.commandConfig?.simpleCommands || {}).includes(
          commandName
        ) ||
        config.commandConfig?.hiddenCommands?.includes(commandName) ||
        config.commandConfig?.killedCommands?.includes(commandName) ||
        commandState.killedCommands.includes(commandName)
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
    const commandsListUrl = config.misc?.commandsListUrl;
    if (commandsListUrl) {
      ctx.botSpeak(
        `For a full list of commands, check out: ${commandsListUrl}`
      );
    }
    return true;
  }
};

export default command;
