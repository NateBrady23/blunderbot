import { Platform } from '../../enums';

const command: Command = {
  name: 'skipsong',
  modOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (
      ctx.tags.owner ||
      ctx.tags['display-name'].toLowerCase() === 'loldayzo'
    ) {
      void services.twitchService.ownerRunCommand(
        '!tts Blunder Master, Dayzo has requested you skip this song.'
      );
    }
    return true;
  }
};

export default command;
