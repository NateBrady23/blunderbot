import { readdirSync } from 'fs';
import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';
import { removeSymbols } from '../../utils/utils';

function getCommandProperties(obj: MessageCommand, name: string): Command {
  return {
    name,
    ownerOnly: obj.ownerOnly,
    aliases: obj.aliases,
    platforms: obj.platforms || [Platform.Twitch, Platform.Discord],
    ownerRunCommands: obj.ownerRunCommands,
    run: (ctx: Context, { services }) => {
      if (obj.commands) {
        obj.commands.forEach((command: string) => {
          if (ctx.platform === Platform.Twitch) {
            command = command.replace(
              /{username}/g,
              removeSymbols(ctx.tags['display-name'])
            );
            void services.twitchService.ownerRunCommand(command, {
              onBehalfOf: ctx.tags['display-name']
            });
          }
        });
      }
      if (obj.message) {
        ctx.botSpeak(obj.message);
      }
      return true;
    },
    coolDown: 2000
  };
}

//

const messageCommands = {};
const messageCommandsConfig = CONFIG?.messageCommands || {};
Object.keys(messageCommandsConfig).forEach((key) => {
  messageCommands[key] = getCommandProperties(messageCommandsConfig[key], key);
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
