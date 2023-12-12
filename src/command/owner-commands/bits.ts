import { playAudioFile } from '../../utils/utils';
import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';
import { YAML_CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();

const command: Command = {
  name: 'bits',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    return queue.enqueue(async function () {
      try {
        let body: any = ctx.body;
        // To test bits like: !bits 420
        if (body.match(/^\d{1,4}$/g)) {
          body = '{ "bits": ' + body + ' }';
        }
        body = JSON.parse(body);
        const bits = parseInt(body.bits) || 0;
        let commands: string[], alert: string;
        if (
          YAML_CONFIG?.bitsConfig.matches &&
          YAML_CONFIG.bitsConfig.matches[bits]
        ) {
          commands = YAML_CONFIG.bitsConfig.matches[bits].commands;
          alert = YAML_CONFIG.bitsConfig.matches[bits].alert;
        } else {
          const key = bits < 100 ? '99orLess' : '100orMore';
          commands = YAML_CONFIG.bitsConfig[key].commands;
          alert = YAML_CONFIG.bitsConfig[key].alert;
        }
        if (commands) {
          for (const cmd of commands) {
            void services.twitchService.ownerRunCommand(cmd);
          }
        }
        if (alert) {
          await playAudioFile(alert);
        }

        // Play a message after all the other alerts and sounds play
        if (body?.message && bits >= 100) {
          body.message = body.message.replace(/cheer\d{1,10}/gi, '').trim();
          await services.twitchService.ownerRunCommand(`!tts ${body.message}`);
        }
      } catch (e) {
        console.log('Error in bits command');
        console.error(e);
      }
    });
  }
};

export default command;
