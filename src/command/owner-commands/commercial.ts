import { ENV } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'commercial',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    void services.twitchService.helixOwnerApiCall(
      'https://api.twitch.tv/helix/channels/commercial',
      'POST',
      {
        broadcaster_id: ENV.TWITCH_OWNER_ID,
        length: 90
      }
    );
    return true;
  }
};

export default command;
