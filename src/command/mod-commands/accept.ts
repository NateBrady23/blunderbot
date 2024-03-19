import { Platform } from '../../enums';

const command: Command = {
  name: 'accept',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const team = services.configV2Service.get().lichess.teamId;
    try {
      const res = await services.lichessService.apiCall(
        `https://lichess.org/api/team/${team}/requests`
      );
      const json = await res.json();
      if (!json?.length) {
        await ctx.botSpeak('No requests to accept');
        return true;
      }
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
            void ctx.botSpeak(
              `Welcome ${user} to ${services.configV2Service.get().lichess.teamName}`
            );
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
            void ctx.botSpeak(
              `Could not accept ${user}'s request to join at this time.`
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
      void ctx.botSpeak(
        `I'm sorry, something went terribly wrong! Please don't fire me!`
      );
    }
    return true;
  }
};

export default command;
