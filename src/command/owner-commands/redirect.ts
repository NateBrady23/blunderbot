import { Platform } from '../../enums';

const command: Command = {
  name: 'redirect',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    services.twitchGateway.sendDataToSockets('serverMessage', {
      type: 'REDIRECT',
      url: ctx.args[0]
    });
    return true;
  }
};

export default command;
