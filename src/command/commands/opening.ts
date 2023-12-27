import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

const lichessUser = CONFIG.lichess.user;

const command: Command = {
  name: 'opening',
  help: `Gets the opening of the current game played by ${lichessUser} unless a lichess gameId is supplied.`,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    let gameId: string;
    if (ctx.args[0]) {
      gameId = ctx.args[0];
    }
    if (!gameId) {
      const res = await services.lichessService.getCurrentGame(lichessUser, {
        gameId: true
      });
      if (!res) {
        ctx.botSpeak(`I can't find a game being played.`);
        return true;
      }
      gameId = res;
    }

    const opening = await services.lichessService.getGameOpening(gameId);
    if (opening) {
      ctx.botSpeak(`The opening is ${opening}`);
    } else {
      ctx.botSpeak(`I can't find the opening for that game.`);
    }
    return true;
  }
};

export default command;
