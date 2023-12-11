import { FunctionQueue } from '../../utils/FunctionQueue';
import { playAudioFile, removeSymbols } from '../../utils/utils';
import { Platform } from '../../enums';
import { YAML_CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();
const raidConfig = YAML_CONFIG.raids || {};

const command: Command = {
  name: 'raids',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function () {
      try {
        const username = ctx.args[0].toLowerCase();
        commandState.contributions.raids[username] = true;

        if (Object.keys(raidConfig).includes(username)) {
          const commands = raidConfig[username].commands;
          for (const cmd of commands) {
            void services.twitchService.ownerRunCommand(cmd);
          }
        } else {
          void services.twitchService.ownerRunCommand('!gif !s19 party');
        }

        await playAudioFile('./public/sounds/snoop.m4a');
        void services.twitchService.ownerRunCommand(
          `!tts hey ${removeSymbols(
            username
          )} and raiders, it's me, blunderbot! thank you so much for the raid!`
        );
      } catch (e) {
        console.log('Error in raids command');
        console.error(e);
      }
    });
  }
};

export default command;
