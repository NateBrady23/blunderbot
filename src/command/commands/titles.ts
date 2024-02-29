import { Platform } from '../../enums';

const command: Command = {
  name: 'titles',
  platforms: [Platform.Twitch, Platform.Discord],
  aliases: ['titties'],
  run: async (ctx, { services }) => {
    const titledPlayers = services.configV2Service.get().lichess.titledPlayers;
    let say = '';
    for (let i = 0; i < titledPlayers.length; i++) {
      say += `${titledPlayers[i][1]} ${titledPlayers[i][0]}`;
      if (i < titledPlayers.length - 1) {
        say += ', ';
      }
    }
    void ctx.botSpeak('The following are titled players on the stream: ' + say);
    return true;
  }
};

export default command;
