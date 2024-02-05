import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'image',
  aliases: ['img', 'mage', 'imagine', 'draw'],
  help: '!image <prompt> - Creates an image based on the prompt.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().openai?.enabled) {
      console.log(`OpenAI is not enabled in !image command.`);
      return false;
    }
    let prompt = ctx.body?.trim();
    let sendToDiscord =
      CONFIG.get().discord?.enabled &&
      !!CONFIG.get().discord?.galleryChannelId &&
      ctx.platform !== Platform.Discord;
    let sendToTwitter =
      CONFIG.get().twitter?.enabled && CONFIG.get().twitter.tweetImagesEnabled;

    const user = ctx.onBehalfOf || ctx.displayName;

    if (!prompt) {
      ctx.reply(ctx, `You need to provide a prompt.`);
      return false;
    }

    ctx.reply(ctx, `Please give me a few moments while I draw your image.`);

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

    if (CONFIG.get().openai.imageEdits.includes(firstWord)) {
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

    // If this is a command run by the owner, don't send to Discord or Twitter
    // Unless it was onBehalf of a user (most common case: Channel Redemption)
    if (ctx.isOwnerRun && !ctx.onBehalfOf) {
      return;
    }

    if (sendToDiscord) {
      services.discordService.postImageToGallery(
        `@${user} on Twitch used "!image ${prompt}"`,
        buffer
      );
    }

    if (sendToTwitter) {
      const hashtags = CONFIG.get().twitter.tweetHashtags || '';
      void services.twitterService.postImage(
        buffer,
        `${user} on Twitch used "!image ${prompt}" ${hashtags}`
      );
    }
  }
};

export default command;
