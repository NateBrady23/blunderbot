import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';
async function getJoke() {
  try {
    const response = await fetch(
      'https://dad-jokes-by-api-ninjas.p.rapidapi.com/v1/dadjokes',
      {
        headers: {
          'X-RapidAPI-Key': CONFIG.getRandomRapidApiKey(),
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
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    if (!CONFIG.get().rapidApi?.enabled) {
      ctx.botSpeak('RapidAPI is disabled in !dadjoke.');
      return false;
    }
    ctx.botSpeak(await getJoke());
    return true;
  }
};

export default command;
