import { Platform } from '../../enums';

const command: Command = {
  name: 'image',
  help: '!image <prompt> - Creates an image based on the prompt.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!ctx.body) {
      ctx.botSpeak(`You need to provide a prompt.`);
      return false;
    }

    ctx.botSpeak('Please give me a few moments while I draw your image.');

    const url = await services.openaiService.createImage(ctx.body);

    services.appGateway.sendDataToSockets('serverMessage', {
      type: 'IMAGE',
      url
    });
    return true;
  }
};

export default command;
