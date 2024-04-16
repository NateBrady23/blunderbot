import { Platform } from '../../enums';

const command: Command = {
  name: 'challenge',
  aliases: ['1v1'],
  help: 'Displays information on how and when to challenge me.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!ctx.isOwner || !ctx.args[0]) {
      void ctx.botSpeak(
        'Challenge me using the challenge channel point redemption during Viewer Challenge streams (Sunday/Tuesday) to get in the queue. (Must be a follower to challenge.) You can also play me during the BBB (Wednesdays) !bbb'
      );
      return true;
    }
    const user = ctx.args[0];
    let timeControls = ['5', '3'];
    if (ctx.args[1]) {
      timeControls = ctx.args[1].split('+');
    }

    let variant = 'standard';
    if (ctx.args[2]) {
      if (
        ![
          'standard',
          'chess960',
          'crazyhouse',
          'antichess',
          'atomic',
          'horde',
          'kingofthehill',
          'racingkings',
          'threecheck'
        ].includes(ctx.args[2].toLowerCase())
      ) {
        void ctx.botSpeak('Invalid variant.');
        return false;
      }
      variant = ctx.args[2];
    }

    try {
      const res = await services.lichessService.apiCall(
        `https://lichess.org/api/challenge/${user}`,
        {
          method: 'POST',
          body: {
            rated: false,
            'clock.limit': parseInt(timeControls[0]) * 60,
            'clock.increment': parseInt(timeControls[1]),
            color: 'random',
            variant,
            rules: 'noGiveTime'
          }
        }
      );
      const json = await res.json();
      if (json.challenge?.url) {
        console.log(`Challenge URL: ${json.challenge.url}`);
      } else {
        console.error(`Error creating challenge: ${user}`);
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  }
};

export default command;
