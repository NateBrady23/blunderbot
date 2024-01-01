import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'image',
  help: '!image <prompt> - Creates an image based on the prompt.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    let prompt = ctx.body?.trim();
    let sendToDiscord = true;

    const user = ctx.tags['display-name'];
    if (!prompt) {
      ctx.botSpeak(`You need to provide a prompt.`);
      return false;
    }

    ctx.botSpeak(
      `@${user} Please give me a few moments while I draw your image.`
    );

    if (prompt.includes('nodiscord')) {
      sendToDiscord = false;
      prompt = prompt.replace(/nodiscord/gi, '').trim();
    }

    let url = '';
    const firstWord = prompt.split(' ')[0].toLowerCase();

    if (firstWord === 'nate') {
      url = await services.openaiService.editImage(
        `./public/images/edits/nate.png`,
        prompt.replace(/nate/i, 'this person')
      );
    } else {
      url = await services.openaiService.createImage(prompt);
    }

    console.log(`Image URL: ${url}`);

    services.appGateway.sendDataToSockets('serverMessage', {
      type: 'IMAGE',
      url
    });

    if (
      sendToDiscord &&
      CONFIG.discord.enabled &&
      CONFIG.discord.galleryChannelId
    ) {
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      services.discordService.postImageToGallery(
        `@${user} on Twitch used !image ${prompt}`,
        buffer
      );
    }
    return true;
  }
};

export default command;
