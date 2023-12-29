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

const MOD_DIR = './src/command/mod-commands';
const OWNER_DIR = './src/command/owner-commands';

const dirImports = [
  ['./src/command/commands', './'],
  [MOD_DIR, '../mod-commands/'],
  [OWNER_DIR, '../owner-commands/']
];

dirImports.forEach((dir) => {
  readdirSync(dir[0]).forEach((file) => {
    const fileName = file.split('.')[0];
    if (fileName !== 'index') {
      commands[fileName] = require(`${dir[1]}${fileName}`).default;
      if (dir[0] === MOD_DIR) {
        commands[fileName].modOnly = true;
      } else if (dir[0] === OWNER_DIR) {
        commands[fileName].ownerOnly = true;
      }
    }
  });
});
