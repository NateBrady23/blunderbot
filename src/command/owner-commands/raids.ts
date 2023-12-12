import { FunctionQueue } from '../../utils/FunctionQueue';
import { playAudioFile, removeSymbols } from '../../utils/utils';
import { Platform } from '../../enums';
import { YAML_CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();
const raidersConfig = YAML_CONFIG.raidConfig.matches || {};

const command: Command = {
  name: 'raids',
  ownerOnly: true,
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
          for (const cmd of YAML_CONFIG?.raidConfig.defaultCommands) {
            void services.twitchService.ownerRunCommand(cmd);
          }
          alert = YAML_CONFIG?.raidConfig?.alert;
        }

        if (alert) {
          await playAudioFile(alert);
        }
        let announcement = YAML_CONFIG.raidConfig?.announcement;
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
