import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'heartrate',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (!CONFIG.heartRate?.enabled) {
      console.log('Heart rate not enabled in config for !heartrate command');
      return false;
    }

    const heartrate = await services.browserService.getHeartRate();
    if (heartrate) {
      await services.twitchService.ownerRunCommand(
        `!tts ${CONFIG.nickname}'s heart rate is ${heartrate} BPM`
      );
    }
    return true;
  }
};

export default command;
