import { Platform } from '../../enums';

const command: Command = {
  name: 'background',
  help: '!background <prompt> - Creates an image to be used as the background.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (
      !services.configV2Service.get().openai?.enabled ||
      !services.configV2Service.get().openai?.imageModel
    ) {
      console.log(`OpenAI is not enabled in !background command.`);
      return false;
    }
    let prompt = ctx.body?.trim();

    if (!prompt) {
      ctx.reply(ctx, `You need to provide a prompt.`);
      return false;
    }

    if (ctx.isMod) {
      if (['off', 'reset'].includes(prompt.toLowerCase())) {
        services.appGateway.sendDataToSockets('serverMessage', {
          type: 'BACKGROUND',
          url: ''
        });
        return true;
      }
    }

    let sendToDiscord =
      services.configV2Service.get().discord?.enabled &&
      !!services.configV2Service.get().discord?.galleryChannelId &&
      ctx.platform !== Platform.Discord;
    if (prompt.toLowerCase().includes('nodiscord')) {
      sendToDiscord = false;
      prompt = prompt.replace(/nodiscord/gi, '');
    }

    const newPrompt =
      'Create a background image for the following prompt: ' + prompt;
    ctx.reply(
      ctx,
      `Please give me a few moments while I create your background.`
    );

    const url = await services.openaiService.createImage(newPrompt, {
      size: '1792x1024'
    });

    if (!url) {
      ctx.reply(
        ctx,
        `I'm sorry, I couldn't create a background for that prompt.`
      );
      return false;
    }

    const user = ctx.onBehalfOf || ctx.displayName;
    void services.twitchService.ownerRunCommand(
      `!alert ${user} has set the background to: ${prompt}`
    );

    console.log(`Image URL: ${url}`);

    services.appGateway.sendDataToSockets('serverMessage', {
      type: 'BACKGROUND',
      url
    });

    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());

    // If this is a command run by the owner, don't send to Discord
    // Unless it was onBehalf of a user (most common case: Channel Redemption)
    if (ctx.isOwnerRun && !ctx.onBehalfOf) {
      return true;
    }

    if (sendToDiscord) {
      services.discordService.postImageToGallery(
        `@${user} on Twitch used "!background ${prompt}"`,
        buffer
      );
    }

    return true;
  }
};

export default command;
