/**
 * TODO: This is a static list so new GMs won't be added.
 */
import { Platform } from '../../enums';
import birthdayList from '../../data/gm-birthdays';
const birthdays = {};

const command: Command = {
  name: 'birthdays',
  help: 'Displays GMs born on this day.',
  hideFromList: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    const date = new Date();
    const month = date.toLocaleString('default', { month: '2-digit' });
    const day = date.toLocaleString('default', { day: '2-digit' });
    const today = `${month}-${day}`;
    if (!birthdays[today]) {
      birthdays[today] = birthdayList.filter((obj) => obj.Born.endsWith(today));
    }

    if (!birthdays[today].length) {
      ctx.botSpeak('No GMs were born on this day.');
      return true;
    }

    let toSay = 'GMs born today include: ';
    for (let i = 0; i < birthdays[today].length; i++) {
      toSay += `${birthdays[today][i].Name}: ${birthdays[today][i].Born}`;
      if (i != birthdays[today].length - 1) {
        toSay += ' -- ';
      }
    }
    ctx.botSpeak(toSay);

    return true;
  }
};

export default command;
