import { Platform } from '../../enums';

const command: Command = {
  name: 'socket',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    services.appGateway.sendDataToSockets(
      'serverMessage',
      JSON.parse(ctx.body)
    );
    return true;
  }
};

export default command;
