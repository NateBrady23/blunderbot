import { Platform } from '../../enums';

const command: Command = {
  name: 'clock',
  modOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (
      ctx.tags.owner ||
      ctx.tags['display-name'].toLowerCase() === 'mammali_77'
    ) {
      void services.twitchService.ownerRunCommand(`!gif tick tock`);
      void services.twitchService.ownerRunCommand(
        "!tts Blunder Master, Mahmahli wants you to know that you're running low on the clock."
      );
    }
    return true;
  }
};

export default command;
