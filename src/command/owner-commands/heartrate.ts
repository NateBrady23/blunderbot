import { Platform } from '../../enums';
import { ENV } from '../../config/config.service';

const command: Command = {
  name: 'heartrate',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (!ENV.HEART_RATE_ENABLED) return;

    const heartrate = await services.browserService.getHeartRate();
    if (heartrate) {
      await services.twitchService.ownerRunCommand(
        `!tts BM Nate's heart rate is ${heartrate} BPM`
      );
    }
    return true;
  }
};

export default command;
