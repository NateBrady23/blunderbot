import { CONFIG, configService } from '../../config/config.service';
import { Platform } from '../../enums';
async function getHistory() {
  try {
    const response = await fetch(
      'https://today-in-history.p.rapidapi.com/thisday',
      {
        headers: {
          'X-RapidAPI-Key': configService.getRandomRapidApiKey(),
          'X-RapidAPI-Host': 'today-in-history.p.rapidapi.com'
        }
      }
    );
    const res = await response.json();
    return `Today in history: On ${res.article.date}, ${res.article.title} ${res.article.url}`;
  } catch (error) {
    console.error(error);
  }
}

const command: Command = {
  name: 'today',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    if (!CONFIG.rapidApi.enabled) {
      ctx.botSpeak('RapidAPI is disabled in !today.');
      return false;
    }
    ctx.botSpeak(await getHistory());
    return true;
  }
};

export default command;
