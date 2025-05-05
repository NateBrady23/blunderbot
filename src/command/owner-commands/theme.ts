import { Platform } from '../../enums';

const command: Command = {
  name: 'theme',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const themes = services.configV2Service.get().themeConfig;
    if (themes?.[ctx.args[0] as keyof typeof themes]) {
      const theme = (ctx.args[0] || '').toLowerCase();
      services.twitchGateway.sendDataToOneSocket('serverMessage', {
        type: 'THEME',
        theme
      });
    } else {
      console.log('Theme not found: ', ctx.args[0]);
      return false;
    }
    return true;
  }
};

export default command;
