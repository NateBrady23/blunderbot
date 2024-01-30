import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'king',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const kings = CONFIG.get().kings;
    let king = (ctx.args[0] || '').toLowerCase();
    if (king === 'random') {
      const filteredKings = kings.filter((k) => !k.startsWith('secret_'));
      king = filteredKings[Math.floor(Math.random() * filteredKings.length)];
    } else if (!king || !kings.includes(king)) {
      ctx.botSpeak(
        `The following kings are available: ${CONFIG.get()
          .kings.filter((k) => !k.startsWith('secret_'))
          .join(', ')}`
      );
      return false;
    }
    const user = ctx.displayName;
    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'KING',
      king
    });
    if (!ctx.isOwner && !king.startsWith('secret_')) {
      void services.twitchService.ownerRunCommand(
        `!alert {${user}} changed the king to {${king}}`
      );
    }
  }
};

export default command;
