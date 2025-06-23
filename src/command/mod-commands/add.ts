import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'add',
  aliases: ['addcom'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().db?.enabled) {
      console.error('Database is not enabled for !add command');
      return false;
    }
    const name = ctx.args[0]?.replace('!', '')?.toLowerCase();
    if (!name) {
      return false;
    }
    const regex = new RegExp(`^${name} `);
    const message = ctx.body?.replace(regex, '') || '';
    try {
      const existingCommand =
        await services.storedCommandEntityService.findByName(name);
      if (existingCommand) {
        // Update the command instead of adding a new one
        existingCommand.message = message;
        await services.storedCommandEntityService.save(existingCommand);
        ctx.reply(ctx, 'Command updated');
      } else {
        await services.storedCommandEntityService.create({
          name,
          message
        });
        ctx.reply(ctx, 'Command added');
      }
      await services.commandService.setStoredCommands();
    } catch (e) {
      console.error(e);
      ctx.reply(ctx, 'Error adding command');
      return false;
    }
    return true;
  }
};

export default command;
