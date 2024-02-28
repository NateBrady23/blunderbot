import { Platform } from '../../enums';
async function getJoke(apiKey: string) {
  try {
    const response = await fetch(
      'https://dad-jokes-by-api-ninjas.p.rapidapi.com/v1/dadjokes',
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
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
  run: async (ctx, { services }) => {
    const apiKey = services.configV2Service.get().misc?.rapidApiKey;
    if (!apiKey) {
      console.log('RapidAPI is disabled in !dadjoke.');
      return false;
    }
    ctx.botSpeak(await getJoke(apiKey));
    return true;
  }
};

export default command;
