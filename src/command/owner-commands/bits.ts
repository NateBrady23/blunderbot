import { playAudioFile } from '../../utils/utils';
import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'bits',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function () {
      try {
        let body: any = ctx.body;
        // To test bits like: !bits 420
        if (body.match(/^\d{1,4}$/g)) {
          body = '{ "bits": ' + body + ' }';
        }
        body = JSON.parse(body);
        const bits = parseInt(body.bits) || 0;
        if (bits === 420) {
          void services.twitchService.ownerRunCommand('!gif snoop dogg');
          void services.twitchService.ownerRunCommand('!king secret_smoking');
          void services.twitchService.ownerRunCommand('!opp secret_snoop');
          await playAudioFile('./public/sounds/snoop.m4a');
        } else if (bits === 69) {
          void services.twitchService.ownerRunCommand('!gif giggity');
          void services.twitchService.ownerRunCommand('!king secret_69');
          void services.twitchService.ownerRunCommand('!opp secret_quagmire');
          await playAudioFile('./public/sounds/giggity.m4a');
        } else if (bits === 314) {
          void services.twitchService.ownerRunCommand('!gif !s15 pi');
          void services.twitchService.ownerRunCommand('!king secret_pie');
          void services.twitchService.ownerRunCommand('!opp secret_pie');
          await playAudioFile('./public/sounds/pie.m4a');
        } else if (bits >= 100) {
          void services.twitchService.ownerRunCommand('!gif !s12 cheers');
          await playAudioFile('./public/sounds/tig-ol-bitties.m4a');
        } else {
          // Lower number of bits play quick alert
          void services.twitchService.ownerRunCommand('!gif !s3 cheers');
          void services.twitchService.ownerRunCommand('!king random');
          void services.twitchService.ownerRunCommand('!opp random');
          await playAudioFile('./public/sounds/tig-ol-bitties-short.m4a');
        }

        if (body?.message) {
          body.message = body.message.replace(/cheer\d{1,10}/gi, '').trim();
        }
        // Play a message after all the other alerts and sounds play
        if (body?.message && bits >= 69) {
          await services.twitchService.ownerRunCommand(`!tts ${body.message}`);
        }
        if (body?.user) {
          commandState.contributions.bits[body.user] =
            (commandState.contributions.bits[body.user] || 0) + bits;
          void services.twitchService.ownerRunCommand(
            `!alert ${body.user} cheered ${bits} bits! Thank you for the bits!`
          );
        }
      } catch (e) {
        console.log('Error in bits command');
        console.error(e);
      }
    });
  }
};

export default command;
