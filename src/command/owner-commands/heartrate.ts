import { Platform } from '../../enums';

const command: Command = {
  name: 'heartrate',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (!services.configV2Service.get().misc.hypeRateEnabled) {
      console.log('Heart rate not enabled in config for !heartrate command');
      return false;
    }

    const heartrate = await services.browserService.getHeartRate();
    if (heartrate) {
      await services.twitchService.ownerRunCommand(
        `!tts ${services.configV2Service.get().twitch.ownerUsername}'s heart rate is ${heartrate} BPM`
      );
    }
    return true;
  }
};

export default command;
