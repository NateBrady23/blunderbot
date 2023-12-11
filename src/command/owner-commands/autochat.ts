import { Platform } from '../../enums';
import { YAML_CONFIG } from '../../config/config.service';

let commandsToCycle = YAML_CONFIG.autoCommands || [];
let currentInterval = null;

const command: Command = {
  name: 'autochat',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    // Always clearing the interval so multiple "on"s don't stack and anything else shuts it off
    clearInterval(currentInterval);
    if (ctx.body === 'on') {
      currentInterval = setInterval(
        () => {
          if (!commandsToCycle.length) {
            commandsToCycle = YAML_CONFIG.autoCommands || [];
          }

          // If there are still no commands to cycle, don't run anything
          if (!commandsToCycle.length) {
            return;
          }

          const commands = commandsToCycle.shift().commands;
          commands.forEach((c: string) => {
            void services.twitchService.ownerRunCommand(c);
          });
        },
        60 * 1000 * 2.5
      );
    }
    return true;
  }
};

export default command;
