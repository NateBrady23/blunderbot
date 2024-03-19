import { Platform } from '../../enums';

const command: Command = {
  name: 'followage',
  help: 'How long a twitch user has been following my channel. If no user is provided, it will display the followage for the user using the command.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!services.configV2Service.get().misc?.decapiToken) {
      console.log('DecAPI is not enabled for !followage command.');
      return false;
    }

    const decapiToken = services.configV2Service.get().misc?.decapiToken;
    const channel = services.configV2Service.get().twitch.ownerUsername;

    let user = ctx.args[0];
    if (!user) {
      if (ctx.platform === Platform.Twitch) {
        user = ctx.displayName;
      } else {
        void ctx.botSpeak(
          'Please provide a twitch username to check followage for'
        );
        return false;
      }
    }

    const url = `https://beta.decapi.me/twitch/followage/${channel}/${user}?token=${decapiToken}`;

    const res = await (await fetch(url)).text();
    if (res.includes('does not follow')) {
      void ctx.botSpeak(`${user} does not follow https://twitch.tv/${channel}`);
    } else {
      void ctx.botSpeak(
        `${user} has been following https://twitch.tv/${channel} for ${res}`
      );
    }

    return true;
  }
};

export default command;
