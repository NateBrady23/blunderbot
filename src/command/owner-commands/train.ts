import { playAudioFile } from '../../utils/utils';
import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'train',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    return queue.enqueue(async function () {
      void services.twitchService.ownerRunCommand(
        '!gif !s29 Sunglasses Racing GIF By Burger Records'
      );
      void services.twitchService.ownerRunCommand('!king secret_train');
      await playAudioFile('./public/sounds/train.m4a');
    });
  }
};

export default command;
