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
        user: ctx.displayName
      });
      if (!ctx.isOwner) {
        void services.twitchService.ownerRunCommand(
          `!alert {${ctx.displayName}} reset my crown`
        );
      }
      return true;
    }

    if (!crown || !services.configV2Service.get().crowns.includes(crown)) {
      void ctx.botSpeak(
        `The following crowns are available: ${services.configV2Service
          .get()
          .crowns.join(', ')}. "!crown reset" to return to normal.`
      );
      return false;
    }

    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'CROWN',
      crown,
      user: ctx.displayName
    });
    if (!ctx.isOwner && !crown.startsWith('secret_')) {
      void services.twitchService.ownerRunCommand(
        `!alert {${ctx.displayName}} changed my crown to {${crown}}`
      );
    }

    return true;
  }
};
export default command;
