# Release Notes

### 1.3.0 (2024-01-08)

#### Breaking Changes

- PUBSUB is here!
- Removed all the custom rewards functionality from the previous iteration. All custom rewards are now under `twitch.customRewardCommands`. Getting the custom reward id is no longer necessary.
- BlunderBot will start remembering conversations with users. In this config this is under `openai.memoryCount`
- Added tmi.js types package.

#### Features

- Added twitch's eventsub as well just to start looking at events coming in
- Added an `!opp-rating` owner command to support the new custom reward changes.
- Edited the `!queue` command with "add" support for owners to support the new custom reward changes and moved the queue to command state.
- OwnerRunCommands now have "onBehalfOf" support for the new custom reward changes.
- Owner generated images don't get posted to twitter/discord by default, unless they were "onBehalfOf" a user.

#### Bug Fixes

- Fixed a bug where empty args weren't being filtered out of context
- Owner run commands from the command input are no longer being "suggested" if they are typos.
- Fixed types and other code cleanup.

### 1.2.0 (2024-01-02)

#### Breaking Changes

- New twitter package and other package updates.

#### Features

- Added Twitter API support for going live announcements and sharing images from the `!image` command.
- `notwitter` and `nodiscord` can both be used in the `!live` and `!image` commands to prevent sending to those platforms even if those platforms are enabled.
- images can now be edited, thanks Trevlar! Unfortunately this is still using dall-e-2, so it's not perfect, but it's a fun start.
- If `!image` includes `nodiscord`, the image won't be sent to discord even if discord is enabled.
- Added ability to fix pronunciations before they're sent to the tts service, thanks Trevlar!
- AutoShoutout all raiders, even if they're not in the autoShoutout list.

#### Bug Fixes

- Fixed an issue with the bits not adding users to the contributions list properly.
- Removed all cheer messages from the `!bits` command before `!tts` is used.
- Fixed the `!help` command to show help when an alias is used.
- General code cleanup and refactoring.
- Fixed the `!add` command removing the command from the body if it existed. Also allows syntax like `!addcom !somecom <body>` for people familiar with other bots.

### 1.1.3 (2023-12-30)

#### Bug Fixes

- Fixed a missing space in the message about user restricted commands.
- Fixed the opacity on the board so gifs show up better.
- Fixed an issue with the `!buy` command where it wasn't trimming the username.
- Fixed an issue with the BlunderBot menu not getting event listeners on time.

### 1.1.2 (2023-12-30)

#### Bug Fixes

- There was at least one command in the `owner-commands` dir that I forgot to add `ownerOnly: true` to, so now all commands in the owner directory and mod directory will automatically get `ownerOnly: true` and `modOnly: true` respectively.
- Fix `any` usage in `command.types.d.ts` to properly type services in command files.
- Fix an issue with `!bits` where users weren't getting added to the contributions to be thanked at the end of the stream.
- Fix an issue with subCommands being wrong in the types file.

#### Features

- Added a `!resetlimits` owner command. Without an arg, it resets the limits on all commands. Or you can reset the limits on one command like `!resetlimits image`.
- Added a `!resign` command to tell the streamer it's time to end the madness. I added this as a user restricted command in the config.

### 1.1.1 (2023-12-30)

#### Bug Fixes

- Fixed the `!gif` command where gifs the API KEY wasn't being passed in the request after the move from .env

#### Features

- Added the ability to upload images from the !image command to discord

### 1.1.0 (2023-12-28)

#### Breaking Changes

- Moved `followerCommands`, `subScommands`, and `limitedCommands` to the config file under `twitch`

#### Bug Fixes

- Fixed determining whether a main board is present for the `!gif` command
- Fixed a bug with Blunder Alerts not connecting to the right socket namespace

#### Features

- Added a `!image <description>` command to generate images using the OpenAI API
- First time chatters that are followers will now get a random square on the board


### 1.0.0 (2023-12-27)

#### Breaking Changes

- All the config now lives in the `config.yml(.sample)` file
- Moved allowing specific users to run commands to the config file under `twitch.userRestrictedCommands`
- Moved `hiddenCommands` to the config file to allow other users more granular control over which commands are hidden
- Added a `!help` command

#### Bug Fixes

- Removed all references to Blunder Master / Nate in commands
- Fixed raid alerts when matching a specific raider
- Moved the mute/unmute commands to the config under `sounds.mute.programs` and `sounds.unmute.programs`. This allows for people to easily change which programs they want muted and which command to run to do the muting.
- Fix the lichess command input to stick to the bottom left corner of the browser
- Fixed the title that shows up in the lichess header for the current user

#### Features

- Added an `enabled` config option for most APIs in the config
- In most commands requiring an api key, now first check if that config section is `enabled` and log a message if the command is run and not enabled
- Added a `!today` command to display a historical fact about this day in history
- Added a `rating` and `opening` button to the lichess overlay during active games

### 0.11.4 (2023-12-20)

#### Bug Fixes

- Fixed a bug in `!gpredict` where the bot would announce the game prediction even if creating the prediction failed
- Fixed a bug in `!gpredict` where the bot would announce the default game prediction options even if custom options were passed.
- Fixed a bug in `!suggest` where we were only caching and replaying the first response.
- Replaced hardcoded Nate Brady with `NICKNAME` env var in the `!live` command.

#### Features

- Added a `nodiscord` option to the `!live` command such that `!live nodiscord` will turn on autochat and set the live state without sending a discord message.

### 0.11.3 (2023-12-15)

#### Bug Fixes

- Fixed a spot where blunderbot23 was hardcoded in the twitch service so pinging a new bot name wouldn't auto respond.
- Removed hardcoded blunderbot string from the openai service.

#### Features

- Added an `autoResponder` config to the `config.yml` file for tracking auto responses to messages in chat
- Added a new command `!opening` to display the opening of the current game or a game id if provided.

### 0.11.2 (2023-12-13)

#### Bug Fixes

- `/public/private` just isn't jiving for me. Adding `.gitignore`s to asset directories after putting a base number of assets in them. Now people can add/remove/whatever without affecting the git repository.

### 0.11.1 (2023-12-12)

#### Bug Fixes

- Multiple root static paths weren't working, so added a `/public/private` (ridiculous) folder for serving static assets but keeping them out of git.

#### Features

- Added a `gifConfig` in the `config.yml(.sample)` file for tracking special gifs
- Added an `openaiConfig` in the `config.yml(.sample)` file for tracking voices allowed for BlunderBot

### 0.11.0 (2023-12-12)

#### Breaking Changes

- Moved `raids` to `raidConfig` under `matches` in the same way we do `bitsConfig` so it makes more sense

#### Features

- Added the ability to add specific alert sounds for specific raid matches

### 0.10.1 (2023-12-12)

#### Features

- Added `/private` and `/priv` directories to the `.gitignore` file
- Created a `raidsConfig` in the `config.yml(.sample)` file
- Created a `bitsConfig` in the `config.yml(.sample)` file

### 0.10.0 (2023-12-11)

#### Features

- Added a `config.yml(.sample)` file to the root of the project for more complicated environment variables.
  - Moved the "autochat"ted commands out of the codebase and into this config
  - Moved simple message commands out of the codebase and into this config
  - Moved running commands on certain raids out of the codebase and into this config
- Added a `NICKNAME` env var to help remove the hardcoded Nate Brady stuff.
- Added an optional `KILLED_COMMANDS` env var to disable commands without having to alter the codebase.

### 0.9.2 (2023-12-02)

#### Bug Fixes

- Fixed the `!live` command to work to turn on autochat and set the live state even if discord is disabled.

#### Features

- Added `OptionalEnvironmentVariable` enum
- Moved twitch custom rewards to its own service
- Added ENV vars for all existing twitch custom rewards

### 0.9.1 (2023-12-01)

#### Bug Fixes

- Fixed a bug where not sending a body to the translation command showed `undefined (undefined)`.

#### Features

- Now if `!gpredict` has only one outcome bet on, any resolution will cancel the prediction instead.
- New env vars `WELCOMING_NON_FOLLOWERS_ENABLED` and `WELCOME_MESSAGE`
- `!github` command to say that blunderbot is open sourced and sends the link
- New env var `DISCORD_BOT_AUTHOR_ID` to fix hard coded bot id references in the discord service
