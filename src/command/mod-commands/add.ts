import { Platform } from '../../enums';

const command: Command = {
  name: 'add',
  modOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    commandState.ephemeralCommands[ctx.args[0]] = ctx.body.replace(
      `${ctx.args[0]} `,
      ''
    );
    console.log(commandState.ephemeralCommands);
    return true;
  }
};

export default command;
