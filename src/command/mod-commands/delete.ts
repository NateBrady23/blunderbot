import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'delete',
  aliases: ['delcom'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().db?.enabled) {
      console.error('Database is not enabled for !delete command');
      return false;
    }
    const name = ctx.args[0]?.replace('!', '')?.toLowerCase();
    if (!name) {
      return false;
    }
    try {
      const existingCommand =
        await services.storedCommandEntityService.findByName(name);
      if (existingCommand) {
        await services.storedCommandEntityService.remove(existingCommand);
        ctx.reply(ctx, 'Command deleted');
      } else {
        ctx.reply(ctx, 'Command does not exist');
      }
      await services.commandService.setStoredCommands();
    } catch (e) {
      ctx.reply(ctx, 'Error deleting command');
      return false;
    }
    return true;
  }
};

export default command;
