import { Platform } from '../../enums';

const command: Command = {
  name: 'king',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const kings =
      services.configV2Service.get().kings?.map((k) => k.split('.')[0]) ?? [];
    const filteredKings = kings.filter((k) => !k.startsWith('secret_'));
    let king = (ctx.args[0] || '').toLowerCase();
    if (king === 'random') {
      king = filteredKings[Math.floor(Math.random() * filteredKings.length)];
    } else if (
      !king ||
      !kings.includes(king) ||
      (!ctx.isOwner && king.startsWith('secret_'))
    ) {
      const kingsUrl = services.configV2Service.get().twitch?.kingsGalleryUrl;
      if (kingsUrl) {
        void ctx.botSpeak(`Check out the gallery at ${kingsUrl}`);
      } else {
        void ctx.botSpeak(
          `The following kings are available: ${filteredKings.join(', ')}`
        );
      }
      return false;
    }
    const user = ctx.displayName;

    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'KING',
      king: services.configV2Service
        .get()
        .kings?.find((k) => k.startsWith(king))
    });
    if (!ctx.isOwner && !king.startsWith('secret_')) {
      void services.twitchService.ownerRunCommand(
        `!alert {${user}} changed the king to {${king}}`
      );
    }
    return true;
  }
};

export default command;
