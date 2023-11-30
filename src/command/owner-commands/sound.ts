import { playAudioFile } from '../../utils/utils';
import { FunctionQueue } from '../../utils/FunctionQueue';
import * as fs from 'fs';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'sound',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx) => {
    return queue.enqueue(async function () {
      if (!ctx.body) {
        return false;
      }
      const filename = ctx.body.split(' ').join('-');
      let file;
      const extensions = ['.m4a', '.mp3', '.wav'];
      for (const extension of extensions) {
        if (
          fs.existsSync(`./public/sounds/soundboard/${filename}${extension}`)
        ) {
          file = `${filename}${extension}`;
          break;
        }
      }

      if (!file) {
        return false;
      }

      await playAudioFile(`./public/sounds/soundboard/${file}`);
      return true;
    });
  }
};

export default command;
