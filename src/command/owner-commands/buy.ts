import { Platform } from '../../enums';

const command: Command = {
  name: 'buy',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const square = ctx.args[0].trim().substring(0, 2).toLowerCase();
    if (!square.match(/^[a-h][1-8]$/)) {
      ctx.botSpeak('Invalid square! Please try again.');
      return;
    }
    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'BOUGHT_SQUARES',
      user: ctx.args[1],
      square
    });
    void services.twitchService.ownerRunCommand(
      `!alert ${ctx.args[1]} just bought the ${square} square!`
    );
    return true;
  }
};

export default command;
