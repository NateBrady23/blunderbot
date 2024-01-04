import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'image',
  aliases: ['img', 'mage', 'imagine'],
  help: '!image <prompt> - Creates an image based on the prompt.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    let prompt = ctx.body?.trim();
    let sendToDiscord =
      CONFIG.discord.enabled && !!CONFIG.discord?.galleryChannelId;
    let sendToTwitter =
      CONFIG.twitter.enabled && CONFIG.twitter.tweetImagesEnabled;

    const user = ctx.tags['display-name'];
    if (!prompt) {
      ctx.botSpeak(`You need to provide a prompt.`);
      return false;
    }

    ctx.botSpeak(
      `@${user} Please give me a few moments while I draw your image.`
    );

    if (prompt.toLowerCase().includes('nodiscord')) {
      sendToDiscord = false;
      prompt = prompt.replace(/nodiscord/gi, '');
    }

    if (prompt.toLowerCase().includes('notwitter')) {
      sendToTwitter = false;
      prompt = prompt.replace(/notwitter/gi, '');
    }

    let url = '';
    const firstWord = prompt.split(' ')[0].toLowerCase();

    if (CONFIG.openai.imageEdits.includes(firstWord)) {
      const regex = new RegExp(`${firstWord} `, 'i');
      url = await services.openaiService.editImage(
        `./public/images/edits/${firstWord}.png`,
        prompt.replace(regex, 'this person')
      );
    } else {
      url = await services.openaiService.createImage(prompt);
    }

    console.log(`Image URL: ${url}`);

    services.appGateway.sendDataToSockets('serverMessage', {
      type: 'IMAGE',
      url
    });

    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());

    if (sendToDiscord) {
      services.discordService.postImageToGallery(
        `@${user} on Twitch used "!image ${prompt}"`,
        buffer
      );
    }

    if (sendToTwitter) {
      const hashtags = CONFIG.twitter.tweetHashtags || '';
      services.twitterService.postImage(
        buffer,
        `${user} on Twitch used "!image ${prompt}" ${hashtags}`
      );
    }
  }
};

export default command;
