import { Platform } from '../../enums';

const command: Command = {
  name: 'race',
  aliases: ['racer'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    try {
      const res = await services.lichessService.apiCall(
        `https://lichess.org/api/racer`,
        {
          method: 'POST'
        }
      );
      const json = await res.json();
      if (json?.url) {
        ctx.botSpeak('Start your blunder engines! ' + json.url);
      }
    } catch (e) {
      console.log(e);
    }
    return true;
  }
};

export default command;
