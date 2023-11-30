import { Platform } from '../../enums';

const command: Command = {
  name: 'cban',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    const user = ctx.args[0]?.toLowerCase();
    if (!user) {
      // output list of cban users
      console.log(commandState.cbanUsers);
      return true;
    }
    if (commandState.cbanUsers.includes(user)) {
      commandState.cbanUsers = commandState.cbanUsers.filter((u) => u !== user);
    } else {
      commandState.cbanUsers.push(user);
    }
    return true;
  }
};

export default command;
