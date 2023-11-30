import { Platform } from '../../enums';

const command: Command = {
  name: 'vchat',
  limitedTo: 3,
  subOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const reply = await services.openaiService.getReplyFromContext(ctx, {
      services
    });
    await services.twitchService.ownerRunCommand(`!tts ${reply}`);
    return true;
  }
};

export default command;
