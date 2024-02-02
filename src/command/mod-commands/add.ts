import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'add',
  aliases: ['addcom'],
  platforms: [Platform.Twitch],
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
    const message = ctx.body.replace(regex, '');
    try {
      await services.storedCommandEntityService.create({
        name,
        message
      });
      await services.commandService.setStoredCommands();
      ctx.botSpeak('Command added');
    } catch (e) {
      ctx.botSpeak('Error adding command');
      return false;
    }
    return true;
  }
};

export default command;
