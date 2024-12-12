import { Platform } from '../../enums';

const command: Command = {
  name: 'skeet',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }): Promise<boolean> => {
    if (!services.configV2Service.get().bluesky.enabled) {
      console.log('Bluesky disabled in !skeet command');
      return false;
    }

    const msg = ctx.body;
    void services.blueskyService.post(msg);
    return true;
  }
};

export default command;
