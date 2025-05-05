import { Platform } from '../../enums';

const command: Command = {
  name: 'opp-rating',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    let rating: string | number = ctx.body?.trim() || '';
    rating = parseInt(rating);
    if (isNaN(rating) || rating < 1 || rating > 9999) {
      return false;
    }

    services.twitchGateway.sendDataToSockets('serverMessage', {
      type: 'OPP_RATING',
      rating,
      user: ctx.displayName
    });
    return true;
  }
};

export default command;
