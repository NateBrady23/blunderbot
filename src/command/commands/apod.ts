import { Platform } from '../../enums';

interface APODResponse {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
}

const command: Command = {
  name: 'apod',
  help: 'Displays NASA APOD for a given date.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const apiKey = services.configV2Service.get().misc?.nasaApiKey;
    if (!apiKey) {
      return false;
    }
    // Today's date in YYYY-MM-DD format
    let today = ctx.body;

    if (!today?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      today = new Date().toISOString().split('T')[0];
    }
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${today}`
    );
    const data = (await response.json()) as APODResponse;
    if (ctx.platform === Platform.Discord) {
      ctx.botSpeak(
        `${data.title} - ${data.date} - ${data.explanation} - ${data.hdurl}`
      );
    } else {
      ctx.botSpeak(`${data.title} - ${data.date} - ${data.url}`);
    }
    return true;
  }
};

export default command;
