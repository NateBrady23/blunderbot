import { Platform } from '../../enums';
import { getRandomElement } from '../../utils/utils';

const answers = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes definitely',
  'You may rely on it',
  'As I see it yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  "Don't count on it",
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful'
];

const command: Command = {
  name: '8ball',
  help: 'BlunderBot will predict your future. Usage: !8ball <question>',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    ctx.reply(ctx, getRandomElement(answers));
    return true;
  }
};

export default command;
