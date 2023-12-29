import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'accept',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const team = CONFIG.lichess.teamId;
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
            ctx.botSpeak(`Welcome ${user} to ${CONFIG.lichess.teamName}`);
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
