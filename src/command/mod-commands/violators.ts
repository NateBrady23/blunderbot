// TODO: Call the kick api https://lichess.org/team/{teamId}/kick/{userId}
import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'violators',
  platforms: [Platform.Discord],
  run: async (ctx) => {
    const teamId = CONFIG.lichess.teamId;

    fetch(`https://lichess.org/api/team/${teamId}/users`)
      .then((res) => res.text())
      .then((data) => {
        const violators: string[] = [];

        const members = data.split('\n').filter(Boolean);
        members.map((member) => {
          const parsed = JSON.parse(member);

          if (parsed.disabled || parsed.tosViolation || parsed.closed) {
            violators.push(parsed.username);
          }
        });

        if (violators.length === 0) {
          ctx.botSpeak('No violators found!');
        } else {
          let str = `Found ${violators.length} violators!\n`;
          str += '######################\n';
          violators.forEach((violator) => {
            str += `https://lichess.org/@/${violator}\n`;
          });
          str += '######################\n';
          str += `https://lichess.org/team/${teamId}/kick`;
          ctx.botSpeak(str);
        }
      });
    return true;
  }
};

export default command;
