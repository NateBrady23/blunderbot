/**
 * Command: rating
 * Description: Cancels the current poll.
 */

import { ENV } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'cancel',
  modOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const currPoll = await services.twitchService.helixOwnerApiCall(
      'https://api.twitch.tv/helix/polls?broadcaster_id=' + ENV.TWITCH_OWNER_ID,
      'GET'
    );

    await services.twitchService.helixOwnerApiCall(
      'https://api.twitch.tv/helix/polls?broadcaster_id=' +
        ENV.TWITCH_OWNER_ID +
        '&status=TERMINATED' +
        '&id=' +
        currPoll.data[0].id,
      'PATCH'
    );
    return true;
  }
};

export default command;
