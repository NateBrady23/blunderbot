import { FunctionQueue } from '../../utils/FunctionQueue';
import { playAudioFile } from '../../utils/utils';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'party',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    return queue.enqueue(async function () {
      void services.twitchService.ownerRunCommand('!gif !s19 party');
      await playAudioFile('./public/sounds/snoop.m4a');
    });
  }
};

export default command;
