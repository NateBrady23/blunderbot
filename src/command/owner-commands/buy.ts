import { Platform } from '../../enums';

const command: Command = {
  name: 'buy',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const square = ctx.args[0].trim().substring(0, 2).toLowerCase();
    const user = ctx.args[1].trim();

    if (!square.match(/^[a-h][1-8]$/)) {
      ctx.botSpeak('Invalid square! Please try again.');
      return;
    }
    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'BOUGHT_SQUARES',
      user: user,
      square
    });
    void services.twitchService.ownerRunCommand(
      `!alert ${user} just bought the ${square} square!`
    );
    return true;
  }
};

export default command;
