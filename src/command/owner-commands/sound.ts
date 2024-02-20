import { playAudioFile } from '../../utils/utils';
import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';
import { existsSync } from 'fs';

const queue = new FunctionQueue();

const command: Command = {
  name: 'sound',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    return queue.enqueue(async function () {
      if (!ctx.body) {
        return;
      }
      let file;

      if (ctx.body.includes('/')) {
        file = ctx.body;
      } else {
        const filename = ctx.body.split(' ').join('-');
        const extensions = ['.m4a', '.mp3', '.wav'];
        for (const extension of extensions) {
          if (
            existsSync(`./public/sounds/soundboard/${filename}${extension}`)
          ) {
            file = `./public/sounds/soundboard/${filename}${extension}`;
            break;
          }
        }
      }

      if (!file) {
        return false;
      }

      await playAudioFile(file, services.configV2Service);
      return true;
    });
  }
};

export default command;
