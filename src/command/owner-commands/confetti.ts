import { Platform } from '../../enums';

const command: Command = {
  name: 'confetti',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    services.appGateway.sendDataToSockets('serverMessage', {
      type: 'CONFETTI',
      confettiType: ctx.args[0]?.toUpperCase() || 'CONFETTI'
    });
    return true;
  }
};

export default command;
