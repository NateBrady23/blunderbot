# Release Notes

### 1.0.0 (2023-12-21)

#### Breaking Changes

- All the config now lives in the `config.yml(.sample)` file
- Moved allowing specific users to run commands to the config file under `twitch.userRestrictedCommands`

#### Bug Fixes

- Removed all references to Blunder Master / Nate in commands
- Fixed raid alerts when matching a specific raider
- Moved the mute/unmute commands to the config under `sounds.mute.programs` and `sounds.unmute.programs`. This allows for people to easily change which programs they want muted and which command to run to do the muting.

#### Features

- Added an `enabled` config option for most APIs in the config
- In most commands requiring an api key, now first check if that config section is `enabled` and log a message if the command is run and not enabled
- Added a `!today` command to display a historical fact about this day in history

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
