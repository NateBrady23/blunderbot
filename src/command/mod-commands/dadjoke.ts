import { configService } from '../../config/config.service';
import { Platform } from '../../enums';
async function getJoke() {
  try {
    const response = await fetch(
      'https://dad-jokes-by-api-ninjas.p.rapidapi.com/v1/dadjokes',
      {
        headers: {
          'X-RapidAPI-Key': configService.getRandomRapidApiKey(),
          'X-RapidAPI-Host': 'dad-jokes-by-api-ninjas.p.rapidapi.com'
        }
      }
    );
    const answer = await response.json();
    return answer[0].joke;
  } catch (error) {
    console.error(error);
  }
}

const command: Command = {
  name: 'dadjoke',
  modOnly: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    if (
      ctx.tags.owner ||
      ctx.tags['display-name'].toLowerCase() === 'northcarolinadan'
    ) {
      ctx.botSpeak(await getJoke());
    }
    return false;
  }
};

export default command;
