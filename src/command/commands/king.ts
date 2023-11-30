import { configService } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'king',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const kings = configService.getKings();
    let king = (ctx.args[0] || '').toLowerCase();
    if (king === 'random') {
      const filteredKings = kings.filter((k) => !k.startsWith('secret_'));
      king = filteredKings[Math.floor(Math.random() * filteredKings.length)];
    } else if (!king || !kings.includes(king)) {
      ctx.botSpeak(
        `The following kings are available: ${configService
          .getKings()
          .filter((k) => !k.startsWith('secret_'))
          .join(', ')}`
      );
      return false;
    }
    const user = ctx.tags['display-name'];
    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'KING',
      king
    });
    if (!ctx.tags.owner && !king.startsWith('secret_')) {
      services.twitchService.ownerRunCommand(
        `!alert ${user} changed the king to ${king}`
      );
    }
  }
};

export default command;
