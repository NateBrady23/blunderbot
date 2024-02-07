/**
 * Checks to see if the user is part of the auto shoutout config list and if so,
 * sends them a shoutout if they haven't been auto shouted out this stream.
 */
import { Platform } from '../../enums';

const command: Command = {
  name: 'autoshoutout',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    const user = ctx.args[0]?.toLowerCase();
    if (commandState.shoutoutUsers.includes(user)) {
      void services.twitchService.ownerRunCommand(`!so ${user}`);
      commandState.shoutoutUsers = commandState.shoutoutUsers.filter(
        (u) => u !== user
      );
    }
    return true;
  }
};

export default command;
