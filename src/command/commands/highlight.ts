import { Platform } from '../../enums';

const command: Command = {
  name: 'highlight',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const square = ctx.args[0]?.split('');
    if (!square || square.length % 2 !== 0) return false;
    for (let i = 0; i < square.length - 1; i += 2) {
      const col = square[i];
      const row = square[i + 1];
      if (!row || !col) return false;
      if (!'abcdefgh'.includes(col) || !'12345678'.includes(row)) return false;
      services.twitchGateway.sendDataToSockets('serverMessage', {
        type: 'HIGHLIGHT',
        row,
        col,
        color: ctx.args[1] || 'purple',
        user: ctx.displayName
      });
    }

    return true;
  }
};
export default command;
