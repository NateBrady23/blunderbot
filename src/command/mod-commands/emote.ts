import { Platform } from '../../enums';

const command: Command = {
  name: 'emote',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const chatSettings = await services.twitchService.getChatSettings();
    console.log('chatSettings', chatSettings);
    await services.twitchService.updateChatSettings({
      emote_mode: !chatSettings.emote_mode
    });
    return true;
  }
};

export default command;
