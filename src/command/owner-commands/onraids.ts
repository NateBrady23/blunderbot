import { FunctionQueue } from '../../utils/FunctionQueue';
import { removeSymbols } from '../../utils/utils';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'onraids',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    const raidersConfig =
      services.configV2Service.get().twitch?.raids?.matches || {};

    return queue.enqueue(async function () {
      try {
        const username = ctx.args[0].toLowerCase();
        commandState.contributions.raids[username] = true;

        let commands: string[] = [];

        if (Object.keys(raidersConfig).includes(username)) {
          commands = raidersConfig[username].commands;
        } else {
          commands = raidersConfig.default.commands || [];
        }
        for (let cmd of commands) {
          cmd = cmd.replace(/{raider}/g, removeSymbols(username));
          void services.twitchService.ownerRunCommand(cmd);
        }
        return true;
      } catch (e) {
        console.error('Error in raids command');
        console.error(e);
        return false;
      }
    });
  }
};

export default command;
