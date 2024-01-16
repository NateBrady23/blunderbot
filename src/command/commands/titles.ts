import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'titles',
  platforms: [Platform.Twitch, Platform.Discord],
  aliases: ['titties'],
  run: async (ctx) => {
    const titledPlayers = CONFIG.get().titledPlayers;
    let say = '';
    for (let i = 0; i < titledPlayers.length; i++) {
      say += `${titledPlayers[i][1]} ${titledPlayers[i][0]}`;
      if (i < titledPlayers.length - 1) {
        say += ',\n ';
      }
    }
    ctx.botSpeak('The following are titled players on the stream:\n ' + say);
    return true;
  }
};

export default command;
