import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

interface Violator {
  username: string;
  reason: 'TOS violation' | 'Account disabled' | 'Account closed';
}

interface LichessUser {
  username: string;
  disabled?: boolean;
  tosViolation?: boolean;
  closed?: boolean;
}

const command: Command = {
  name: 'violators',
  platforms: [Platform.Discord],
  run: async (ctx) => {
    const teamId = ctx.args[0] || CONFIG.get().lichess.teamId;

    fetch(`https://lichess.org/api/team/${teamId}/users`)
      .then((res) => res.text())
      .then((data) => {
        const violators: Violator[] = [];

        const members = data.split('\n').filter(Boolean);
        members.forEach((member) => {
          const parsed = JSON.parse(member) as LichessUser;

          if (parsed.tosViolation) {
            violators.push({
              username: parsed.username,
              reason: 'TOS violation'
            });
          } else if (parsed.disabled) {
            violators.push({
              username: parsed.username,
              reason: 'Account disabled'
            });
          } else if (parsed.closed) {
            violators.push({
              username: parsed.username,
              reason: 'Account closed'
            });
          }
        });

        if (violators.length === 0) {
          ctx.botSpeak(':white_check_mark: No violators found!');
        } else {
          let str = `:rotating_light: Found ${violators.length}\n`;
          violators.forEach((violator) => {
            str += `<https://lichess.org/@/${violator.username}> (${violator.reason})\n`;
          });
          str += '---\n';
          str += `Kick here: <https://lichess.org/team/${teamId}/kick>`;
          ctx.botSpeak(str);
        }
      });
    return true;
  }
};

export default command;
