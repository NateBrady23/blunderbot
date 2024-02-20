import { Platform } from '../../enums';

const availableCommands: string[] = [];

const command: Command = {
  name: 'blunder',
  aliases: ['commands'],
  help: 'Displays a list of available commands.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: (ctx, { commandState, services }) => {
    const commands = services.configV2Service.get().commands;
    Object.keys(commands).forEach((commandName) => {
      // Hide all simple commands and hidden and killed commands
      if (
        Object.keys(
          services.configV2Service.get().commandConfig?.simpleCommands
        ).includes(commandName) ||
        services.configV2Service
          .get()
          .commandConfig?.hiddenCommands?.includes(commandName) ||
        services.configV2Service
          .get()
          .commandConfig?.killedCommands?.includes(commandName) ||
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
    const commandsListUrl =
      services.configV2Service.get().misc?.commandsListUrl;
    if (commandsListUrl) {
      ctx.botSpeak(
        `For a full list of commands, check out: ${commandsListUrl}`
      );
    }
    return true;
  }
};

export default command;
