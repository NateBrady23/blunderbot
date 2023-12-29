import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'image',
  help: '!image <prompt> - Creates an image based on the prompt.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const prompt = ctx.body?.trim();
    const user = ctx.tags['display-name'];
    if (!prompt) {
      ctx.botSpeak(`You need to provide a prompt.`);
      return false;
    }

    ctx.botSpeak(
      `@${user} Please give me a few moments while I draw your image.`
    );

    const url = await services.openaiService.createImage(prompt);

    console.log(`Image URL: ${url}`);

    services.appGateway.sendDataToSockets('serverMessage', {
      type: 'IMAGE',
      url
    });

    if (CONFIG.discord.enabled && CONFIG.discord.galleryChannelId) {
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      await services.discordService.postImageToGallery(
        `@${user} on Twitch used !image ${prompt}`,
        buffer
      );
    }
    return true;
  }
};

export default command;
