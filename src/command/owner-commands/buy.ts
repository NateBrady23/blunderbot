import { Platform } from '../../enums';
import { chessSquares } from '../../utils/constants';
import { getRandomElement } from '../../utils/utils';

const command: Command = {
  name: 'buy',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    let square;

    if (ctx.args[0] === 'random') {
      const squares = Object.keys(commandState.boughtSquares || {});
      const remainingSquares = chessSquares.filter(
        (sq) => !squares.includes(sq)
      );
      if (remainingSquares.length) {
        square = getRandomElement(remainingSquares);
      } else {
        console.log('No squares left to buy!');
        return false;
      }
    } else {
      square = ctx.args[0]?.trim().substring(0, 2).toLowerCase();
    }

    const user = ctx.args[1]?.trim();

    if (!square || !user) {
      console.log('No square or user provided for !buy command!');
      return false;
    }

    if (!square.match(/^[a-h][1-8]$/)) {
      void ctx.botSpeak('Invalid square! Please try again.');
      return false;
    }
    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'BOUGHT_SQUARES',
      user: user,
      square
    });
    void services.twitchService.ownerRunCommand(
      `!alert {${user}} just bought the {${square}} square!`
    );
    return true;
  }
};

export default command;
