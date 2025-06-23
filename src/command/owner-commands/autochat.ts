import { Platform } from '../../enums';

let currentInterval: undefined | ReturnType<typeof setTimeout>;

const command: Command = {
  name: 'autochat',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    let commandsToCycle =
      services.configV2Service.get().twitch?.autoCommands?.commandSets || [];

    // Always clearing the interval so multiple "on"s don't stack and anything else shuts it off
    clearInterval(currentInterval);

    if (!commandsToCycle.length) {
      return false;
    }

    if (ctx.body === 'on') {
      currentInterval = setInterval(
        () => {
          if (!commandsToCycle.length) {
            commandsToCycle =
              services.configV2Service.get().twitch?.autoCommands
                ?.commandSets || [];
          }

          // If there are still no commands to cycle, don't run anything
          if (!commandsToCycle.length) {
            return;
          }

          const commands = commandsToCycle.shift();
          if (!commands) {
            return false;
          }
          commands.forEach((c: string) => {
            void services.twitchService.ownerRunCommand(c);
          });
        },
        (services.configV2Service.get().twitch?.autoCommands
          ?.timeBetweenSeconds || 0) * 1000 || 250000
      );
    }
    return true;
  }
};

export default command;
