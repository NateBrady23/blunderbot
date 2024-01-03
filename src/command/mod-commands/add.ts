import { Platform } from '../../enums';

const command: Command = {
  name: 'add',
  aliases: ['addcom'],
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    const command = ctx.args[0].replace('!', '');
    const regex = new RegExp(`^${command} `);
    commandState.ephemeralCommands[command] = ctx.body.replace(regex, '');
    console.log(`The ephemeral commands are: `, commandState.ephemeralCommands);
    return true;
  }
};

export default command;
