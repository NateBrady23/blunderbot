import { Platform } from '../../enums';

const command: Command = {
  name: 'opponent',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const kings = services.configV2Service.get().oppKings;
    let king = (ctx.args[0] || '').toLowerCase();
    const filteredKings = kings.filter((k) => !k.startsWith('secret_'));
    if (king === 'random') {
      king = filteredKings[Math.floor(Math.random() * filteredKings.length)];
    } else if (
      !king ||
      !kings.includes(king) ||
      (!ctx.isOwner && king.startsWith('secret_'))
    ) {
      ctx.botSpeak(
        `The following opponent kings are available: ${filteredKings.join(', ')}`
      );
      return false;
    }

    services.twitchGateway.sendDataToSockets('serverMessage', {
      type: 'OPP_KING',
      king
    });

    if (!ctx.isOwner && !king.startsWith('secret_')) {
      void services.twitchService.ownerRunCommand(
        `!alert {${ctx.displayName}} changed my opponent's king to {${king}}`
      );
    }
    return true;
  }
};

export default command;
