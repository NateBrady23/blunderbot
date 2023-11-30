import { configService } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'opponent',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const kings = configService.getOppKings();
    let king = (ctx.args[0] || '').toLowerCase();
    if (king === 'random') {
      const filteredKings = kings.filter((k) => !k.startsWith('secret_'));
      king = filteredKings[Math.floor(Math.random() * filteredKings.length)];
    } else if (!king || !kings.includes(king)) {
      ctx.botSpeak(
        `The following opponent kings are available: ${configService
          .getOppKings()
          .filter((k) => !k.startsWith('secret_'))
          .join(', ')}`
      );
      return false;
    }

    services.twitchGateway.sendDataToSockets('serverMessage', {
      type: 'OPP_KING',
      king
    });

    if (!ctx.tags.owner && !king.startsWith('secret_')) {
      await services.twitchService.ownerRunCommand(
        `!alert ${ctx.tags['display-name']} changed my opponent's king to ${king}`
      );
    }
  }
};

export default command;
