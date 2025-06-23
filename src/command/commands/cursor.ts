import { Platform } from '../../enums';

const command: Command = {
  name: 'cursor',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const cursors =
      services.configV2Service.get().cursors?.map((c) => c.split('.')[0]) ?? [];
    let cursor = (ctx.args?.[0] || '').toLowerCase();

    if (cursor === 'reset') {
      services.twitchGateway.sendDataToOneSocket('serverMessage', {
        type: 'CURSOR',
        cursor: '',
        user: ctx.displayName
      });
      return true;
    }

    if (cursor === 'random') {
      const filteredCursors = cursors.filter((k) => !k.startsWith('secret_'));
      cursor =
        filteredCursors[Math.floor(Math.random() * filteredCursors.length)];
    } else if (!cursor || !cursors.includes(cursor)) {
      void ctx.botSpeak(
        `The following cursors are available: ${services.configV2Service
          .get()
          .cursors?.filter((k) => !k.startsWith('secret_'))
          .join(', ')}`
      );
      return false;
    }
    const user = ctx.displayName;
    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'CURSOR',
      cursor: services.configV2Service
        .get()
        .cursors?.find((c) => c.startsWith(cursor))
    });
    if (!ctx.isOwner && !cursor.startsWith('secret_')) {
      void services.twitchService.ownerRunCommand(
        `!alert {${user}} changed the cursor to {${cursor}}`
      );
    }
    return true;
  }
};

export default command;
