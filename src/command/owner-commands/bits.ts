import { playAudioFile } from '../../utils/utils';
import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();

const command: Command = {
  name: 'bits',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function () {
      let body: any = ctx.body;
      // To test bits like: !bits 420
      if (body.match(/^\d{1,4}$/g)) {
        body = '{ "bits": ' + body + ' }';
      }
      body = JSON.parse(body);
      const bits = parseInt(body.bits) || 0;

      // If there's a user, add them to the contributions to thank them at the end of the stream
      if (body.user) {
        commandState.contributions[body.user] =
          bits + (commandState.contributions[body.user] || 0);
      }

      let commands: string[], alert: string;
      if (CONFIG?.bits.matches && CONFIG.bits.matches[bits]) {
        commands = CONFIG.bits.matches[bits].commands;
        alert = CONFIG.bits.matches[bits].alert;
      } else {
        const key = bits < 100 ? '99orLess' : '100orMore';
        commands = CONFIG.bits[key].commands;
        alert = CONFIG.bits[key].alert;
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
    });
  }
};

export default command;
