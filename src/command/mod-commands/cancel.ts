/**
 * Command: rating
 * Description: Cancels the current poll.
 */

import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'cancel',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const currPoll = await services.twitchService.helixApiCall(
      'https://api.twitch.tv/helix/polls?broadcaster_id=' +
        CONFIG.twitch.ownerId,
      'GET'
    );

    await services.twitchService.helixApiCall(
      'https://api.twitch.tv/helix/polls?broadcaster_id=' +
        CONFIG.twitch.ownerId +
        '&status=TERMINATED' +
        '&id=' +
        currPoll.data[0].id,
      'PATCH'
    );
    return true;
  }
};

export default command;
