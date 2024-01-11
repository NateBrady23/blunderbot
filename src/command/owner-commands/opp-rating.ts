import { Platform } from '../../enums';

const command: Command = {
  name: 'opp-rating',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    let rating: string | number = ctx.body?.trim();
    rating = parseInt(rating);
    if (isNaN(rating) || rating < 1 || rating > 9999) {
      return;
    }

    services.twitchGateway.sendDataToSockets('serverMessage', {
      type: 'OPP_RATING',
      rating,
      user: ctx.tags['display-name']
    });
    return true;
  }
};

export default command;
