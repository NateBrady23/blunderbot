import { Platform } from '../../enums';

const command: Command = {
  name: 'commercial',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    let length = 30;
    if (ctx.args[0]) {
      try {
        length = parseInt(ctx.args[0]);
      } catch (e) {
        console.error('Error parsing commercial length. Setting to 30.', e);
      }
    }
    void services.twitchService.helixApiCall(
      'https://api.twitch.tv/helix/channels/commercial',
      'POST',
      {
        broadcaster_id: services.configV2Service.get().twitch?.ownerId || '',
        length
      }
    );
    return true;
  }
};

export default command;
