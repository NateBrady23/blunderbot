import { CONFIG } from '../../config/config.service';
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
        broadcaster_id: CONFIG.twitch.ownerId,
        length: 90
      }
    );
    return true;
  }
};

export default command;
