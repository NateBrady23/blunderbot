# Release Notes

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
