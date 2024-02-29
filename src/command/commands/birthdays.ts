/**
 * TODO: This is a static list so new GMs won't be added.
 */
import { Platform } from '../../enums';
import { birthdayList } from 'src/data/gm-birthdays';

const command: Command = {
  name: 'birthdays',
  help: 'Displays GMs born on this day.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    const date = new Date();
    const month = date.toLocaleString('default', { month: '2-digit' });
    const day = date.toLocaleString('default', { day: '2-digit' });
    const today = `${month}-${day}`;

    const birthdays = birthdayList.filter((obj) => obj.Born.endsWith(today));

    if (!birthdays.length) {
      void ctx.botSpeak('No GMs were born on this day.');
      return true;
    }

    let toSay = 'GMs born today include: ';
    toSay += birthdays
      .map((obj) => `${obj.Name} (${obj.Born.substring(0, 4)})`)
      .join(', ');

    void ctx.botSpeak(toSay);

    return true;
  }
};

export default command;
