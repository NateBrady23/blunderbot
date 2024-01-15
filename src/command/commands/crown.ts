import { configService } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'crown',
  help: `Change my crown while I'm playing. Ex. !crown tophat`,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const crown = (ctx.args[0] || '').toLowerCase();
    if (crown === 'reset') {
      services.twitchGateway.sendDataToOneSocket('serverMessage', {
        type: 'CROWN',
        crown: '',
        user: ctx.tags['display-name']
      });
      if (!ctx.tags.owner) {
        void services.twitchService.ownerRunCommand(
          `!alert {${ctx.tags['display-name']}} reset my crown`
        );
      }
      return true;
    }

    if (!crown || !configService.getCrowns().includes(crown)) {
      ctx.botSpeak(
        `The following crowns are available: ${configService
          .getCrowns()
          .join(', ')}. "!crown reset" to return to normal.`
      );
      return false;
    }

    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'CROWN',
      crown,
      user: ctx.tags['display-name']
    });
    if (!ctx.tags.owner && !crown.startsWith('secret_')) {
      void services.twitchService.ownerRunCommand(
        `!alert {${ctx.tags['display-name']}} changed my crown to {${crown}}`
      );
    }

    return true;
  }
};
export default command;
