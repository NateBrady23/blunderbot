import { removeSymbols } from '../../utils/utils';
import { Platform } from '../../enums';

const command: Command = {
  name: 'end',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    await services.twitchService.ownerRunCommand('!autochat off');
    const bits = Object.keys(commandState.contributions.bits);
    const subs = Object.keys(commandState.contributions.subs);
    const raids = Object.keys(commandState.contributions.raids);

    if (bits.length || subs.length || raids.length) {
      let msg = 'First a huge thank you to... ';
      if (bits.length) {
        msg += ` ${bits
          .map(
            (b) =>
              `${removeSymbols(b)} for ${
                commandState.contributions.bits[b]
              } bits`
          )
          .join(', ')}`;
      }
      if (raids.length) {
        msg += ` ${raids
          .map((r) => ` ${removeSymbols(r)} for the raid`)
          .join(', ')}`;
      }
      if (subs.length) {
        msg += ` ${subs
          .map((r) => ` ${removeSymbols(r)} for the sub`)
          .join(', ')}`;
      }
      void services.twitchService.ownerRunCommand(`!tts ${msg}`);
    }

    void services.twitchService.ownerRunCommand(
      `!vchat Thank everyone for watching the stream and tell them we'll see them next time, in your own words.`
    );

    setTimeout(
      () => {
        services.commandService.setInitialCommandState();
      },
      1000 * 60 * 5
    );

    return true;
  }
};

export default command;
