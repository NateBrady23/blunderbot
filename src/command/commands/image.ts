import { Platform } from '../../enums';

const command: Command = {
  name: 'image',
  aliases: ['img', 'mage', 'imagine', 'draw'],
  help: '!image <prompt> - Creates an image based on the prompt.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (
      !services.configV2Service.get().openai?.enabled ||
      !services.configV2Service.get().openai?.imageModel
    ) {
      console.log(`OpenAI is not enabled in !image command.`);
      return false;
    }
    if (ctx.platform === Platform.Discord && !ctx.isOwner) {
      return false;
    }
    let prompt = ctx.body?.trim();
    let sendToDiscord =
      services.configV2Service.get().discord?.enabled &&
      !!services.configV2Service.get().discord?.galleryChannelId;
    let sendToBluesky =
      services.configV2Service.get().bluesky?.enabled &&
      services.configV2Service.get().bluesky?.imagesEnabled;

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

    if (prompt.toLowerCase().includes('nobluesky')) {
      sendToBluesky = false;
      prompt = prompt.replace(/nobluesky/gi, '');
    }

    let url = '';
    const firstWord = prompt.split(' ')[0].toLowerCase();

    if (
      services.configV2Service.get().openai?.imageEdits?.includes(firstWord)
    ) {
      const regex = new RegExp(`${firstWord} `, 'i');
      url = await services.openaiService.editImage(
        `./public/images/edits/${firstWord}.png`,
        prompt.replace(regex, 'this person')
      );
    } else {
      url = await services.openaiService.createImage(prompt);
    }

    if (!url) {
      ctx.reply(ctx, `I'm sorry, I couldn't create an image for that prompt.`);
      return false;
    }

    console.log(`Image URL: ${url}`);

    services.appGateway.sendDataToSockets('serverMessage', {
      type: 'IMAGE',
      url
    });

    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());

    // If this is a command run by the owner, don't send to Discord or Bluesky
    // Unless it was onBehalf of a user (most common case: Channel Redemption)
    if (ctx.isOwnerRun && !ctx.onBehalfOf) {
      return true;
    }

    if (sendToDiscord) {
      services.discordService.postImageToGallery(
        `@${user} on Twitch used "!image ${prompt}"`,
        buffer
      );
    }

    if (sendToBluesky) {
      void services.blueskyService.postImage(
        buffer,
        `${user} on Twitch used "!image ${prompt}"`
      );
    }

    return true;
  }
};

export default command;
