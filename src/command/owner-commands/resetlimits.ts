import { Platform } from '../../enums';

const command: Command = {
  name: 'resetlimits',
  platforms: [Platform.Twitch],
  run: async (_ctx, { commandState }) => {
    const command = _ctx.args[0]?.trim();
    // If no command is specified, reset the limits on all commands
    if (!command) {
      commandState.limitedCommands = {};
    } else {
      // If a command is specified, reset the limits on that command
      commandState.limitedCommands[command] = {};
    }
    return true;
  }
};

export default command;
