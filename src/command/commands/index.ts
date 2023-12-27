import { readdirSync } from 'fs';
import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const messageCommands = {};
const messageCommandsConfig = CONFIG.messageCommands;

Object.keys(messageCommandsConfig).forEach((key) => {
  messageCommands[key] = {
    aliases: messageCommandsConfig[key].aliases,
    hideFromList: messageCommandsConfig[key].hideFromList,
    platforms: [Platform.Twitch, Platform.Discord],
    run: (ctx: Context) => {
      ctx.botSpeak(messageCommandsConfig[key].message);
      return true;
    },
    coolDown: 2000
  };
});

export const commands = {
  ...messageCommands
};

const dirImports = [
  ['./src/command/commands', './'],
  ['./src/command/mod-commands', '../mod-commands/'],
  ['./src/command/owner-commands', '../owner-commands/']
];

dirImports.forEach((dir) => {
  readdirSync(dir[0]).forEach((file) => {
    const fileName = file.split('.')[0];
    if (fileName !== 'index' && fileName !== 'messageCommands') {
      commands[fileName] = require(`${dir[1]}${fileName}`).default;
    }
  });
});
