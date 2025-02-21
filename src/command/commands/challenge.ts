import { components, paths } from '@lichess-org/types';
import { Platform } from '../../enums';

type LichessVariant = components['schemas']['VariantKey'];

const variants: LichessVariant[] = [
  'standard',
  'chess960',
  'crazyhouse',
  'antichess',
  'atomic',
  'horde',
  'kingOfTheHill',
  'racingKings',
  'threeCheck'
];

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
    let variant: LichessVariant = 'standard';

    // Process remaining arguments flexibly
    const remainingArgs = ctx.args.slice(1);
    for (const arg of remainingArgs) {
      const requestedVariant = variants.find(
        (v) => v.toLowerCase() === arg.toLowerCase()
      );
      if (arg.includes('+')) {
        // This is a time control
        timeControls = arg.split('+');
      } else if (requestedVariant) {
        // This is a variant
        variant = requestedVariant;
      } else {
        void ctx.botSpeak('Invalid argument provided.');
        return false;
      }
    }

    try {
      const lichessUser = await services.lichessService.isGoodUser(user);
      if (!lichessUser.isValid) {
        console.error(
          '🚨 Challenge: Account not in good standing',
          `https://lichess.org/@/${user}`
        );
        return false;
      }

      const challengeOptions: paths['/api/challenge/{username}']['post']['requestBody']['content']['application/x-www-form-urlencoded'] =
        {
          rated: false,
          'clock.limit': parseInt(timeControls[0]) * 60,
          'clock.increment': parseInt(timeControls[1]),
          color: 'random',
          variant,
          rules: 'noGiveTime'
        };
      const res = await services.lichessService.apiCall(
        `https://lichess.org/api/challenge/${user}`,
        {
          method: 'POST',
          body: challengeOptions
        }
      );
      const json = await res.json();
      if (json.url) {
        console.log(`Challenge URL: ${json.url}`);
        services.twitchService.ownerRunCommand(`!redirect ${json.url}`);
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
