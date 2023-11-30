import { Platform } from '../../enums';
import { ENV } from '../../config/config.service';

const command: Command = {
  name: 'accept',
  modOnly: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const team = ENV.LICHESS_TEAM_ID;
    try {
      const res = await services.lichessService.apiCall(
        `https://lichess.org/api/team/${team}/requests`
      );
      const json = await res.json();
      for (const request of json) {
        const user = request.user.id;
        const acceptUser = await services.lichessService.isGoodUser(user);

        if (acceptUser) {
          const res = await services.lichessService.apiCall(
            `https://lichess.org/api/team/${team}/request/${user}/accept`,
            {
              method: 'POST'
            }
          );
          const json = await res.json();
          if (json.ok) {
            ctx.botSpeak(`Welcome ${user} to ${ENV.LICHESS_TEAM_NAME}`);
          }
        } else {
          const res = await services.lichessService.apiCall(
            `https://lichess.org/api/team/${team}/request/${user}/decline`,
            {
              method: 'POST'
            }
          );
          const json = await res.json();
          if (json.ok) {
            ctx.botSpeak(
              `Could not accept ${user}'s request to join at this time.`
            );
          }
        }
      }
    } catch (e) {
      console.log(e);
      ctx.botSpeak(
        `I'm sorry, something went terribly wrong! Please don't fire me!`
      );
    }
    return true;
  }
};

export default command;
