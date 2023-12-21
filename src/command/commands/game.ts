import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

const lichessUser = CONFIG.lichess.user;

const command: Command = {
  name: 'game',
  help: `Displays a link to the currently played game by user. If no user, defaults to ${lichessUser}.`,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    let user = lichessUser;
    if (ctx.args[0]) {
      user = ctx.args[0];
    }
    const res = await services.lichessService.getCurrentGame(user);
    if (!res) {
      ctx.botSpeak(`I can't find a game for that user.`);
      return true;
    }
    ctx.botSpeak(`${user} is playing ${res}`);
    return true;
  }
};

export default command;
