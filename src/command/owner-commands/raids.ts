import { FunctionQueue } from '../../utils/FunctionQueue';
import { playAudioFile, removeSymbols } from '../../utils/utils';
import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();
const raidersConfig = CONFIG.raids.matches || {};

const command: Command = {
  name: 'raids',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
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
          for (const cmd of CONFIG.raids?.defaultCommands) {
            void services.twitchService.ownerRunCommand(cmd);
          }
        }
        if (!alert) {
          alert = CONFIG.raids?.alert;
        }
        if (alert) {
          await playAudioFile(alert);
        }
        let announcement = CONFIG.raids?.announcement;
        if (announcement) {
          announcement = announcement.replace(
            /{raider}/g,
            removeSymbols(username)
          );
          void services.twitchService.ownerRunCommand(`!tts ${announcement}`);
        }
      } catch (e) {
        console.log('Error in raids command');
        console.error(e);
      }
    });
  }
};

export default command;
