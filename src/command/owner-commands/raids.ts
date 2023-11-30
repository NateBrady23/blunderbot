import { FunctionQueue } from '../../utils/FunctionQueue';
import { playAudioFile, removeSymbols } from '../../utils/utils';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'raids',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function () {
      try {
        const username = ctx.args[0].toLowerCase();
        commandState.contributions.raids[username] = true;

        if (username === 'imrosen') {
          void services.twitchService.ownerRunCommand('!gif !s19 party');
          void services.twitchService.ownerRunCommand('!opp rosen');
        } else if (username === 'art_vega1983') {
          void services.twitchService.ownerRunCommand('!gif !s19 party');
          void services.twitchService.ownerRunCommand('!opp artvega');
        } else if (username === 'themothman_') {
          void services.twitchService.ownerRunCommand('!opp mothman');
          void services.twitchService.ownerRunCommand('!gif !s19 mothman');
        } else if (username === 'thecheesemate') {
          void services.twitchService.ownerRunCommand('!opp cheesemate');
          void services.twitchService.ownerRunCommand('!gif !s19 cheesy');
        } else if (username === 'lucyplayschess') {
          void services.twitchService.ownerRunCommand(
            '!gif !s19 lucy charlie brown'
          );
          void services.twitchService.ownerRunCommand('!opp lucy');
        } else if (username === 'buttery_flaky') {
          void services.twitchService.ownerRunCommand('!gif !s19 butter');
          void services.twitchService.ownerRunCommand('!opp buttery_flaky');
        } else if (username === 'strobex_gaming') {
          void services.twitchService.ownerRunCommand(
            '!gif !s19 evil mustache man'
          );
          void services.twitchService.ownerRunCommand('!opp strobex_gaming');
        } else if (username === 'northcarolinadan') {
          void services.twitchService.ownerRunCommand('!gif !s19 jayhawk');
          void services.twitchService.ownerRunCommand('!opp jayhawk');
        } else if (username === 'beholdg4') {
          void services.twitchService.ownerRunCommand('!gif !s19 g letter');
          void services.twitchService.ownerRunCommand('!opp einstein');
        } else {
          void services.twitchService.ownerRunCommand('!gif !s19 party');
        }
        await playAudioFile('./public/sounds/snoop.m4a');
        void services.twitchService.ownerRunCommand(
          `!tts hey ${removeSymbols(
            username
          )} and raiders, it's me, blunderbot! thank you so much for the raid!`
        );
      } catch (e) {
        console.log('Error in raids command');
        console.error(e);
      }
    });
  }
};

export default command;
