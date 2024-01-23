import { FunctionQueue } from '../../utils/FunctionQueue';
import { playAudioFile, removeSymbols } from '../../utils/utils';
import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();

const command: Command = {
  name: 'onraids',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    const raidersConfig = CONFIG.get().raids.matches || {};

    return queue.enqueue(async function () {
      try {
        const username = ctx.args[0].toLowerCase();
        commandState.contributions.raids[username] = true;

        let alert;

        if (Object.keys(raidersConfig).includes(username)) {
          const commands = raidersConfig[username].commands;
          for (const cmd of commands) {
            void services.twitchService.ownerRunCommand(cmd);
          }
          if (raidersConfig[username].alert) {
            alert = raidersConfig[username].alert;
          }
        } else {
          for (const cmd of CONFIG.get().raids?.defaultCommands) {
            void services.twitchService.ownerRunCommand(cmd);
          }
        }
        if (!alert) {
          alert = CONFIG.get().raids?.alert;
        }
        if (alert) {
          await playAudioFile(alert);
        }
        let announcement = CONFIG.get().raids?.announcement;
        if (announcement) {
          announcement = announcement.replace(
            /{raider}/g,
            removeSymbols(username)
          );
          void services.twitchService.ownerRunCommand(`!tts ${announcement}`);
        }
      } catch (e) {
        console.error('Error in raids command');
        console.error(e);
      }
    });
  }
};

export default command;
