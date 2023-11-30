import { Platform } from '../../enums';

const command: Command = {
  name: 'trophy',
  modOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (
      ctx.tags.owner ||
      ctx.tags['display-name'].toLowerCase() === 'trevlar_'
    ) {
      void services.twitchService.ownerRunCommand(`!king secret_trophy`);
      void services.twitchService.ownerRunCommand(
        "!tts Blunder Master, Trevlar wants you to know that you've got yourself another Rosen trophy."
      );
    }
    return true;
  }
};

export default command;
