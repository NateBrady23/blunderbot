# Release Notes

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