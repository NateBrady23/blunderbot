### 2.11.1 (2025-06-23)

#### Bug Fixes

- BBB announcement, commentary, and recap is now based on next BBB start time versus the legacy 7pm start time.
- Package updates and other minor fixes.

### 2.11.0

#### Features

- `!onsubs` without a body will simulate a subscription event without a user.
- Automatic commentary for BBB tournaments. Thanks @fitztrev!
- `!challenge` command now checks if the user is a good user before sending the challenge. Thanks @fitztrev!

#### Bug Fixes

- Fixed a bug where `!violators` was not getting the full user data from lichess.
- Fixed a fatal bug where locked temp files that can't be deleted will now be skipped instead of crashing the bot.

#### Breaking Changes

- Removed reliance on pubsub, which is being slowly deprecated by Twitch starting on February 10, 2025.

### 2.10.0 (2025-02-07)

#### Features

- Added `!redirect` owner command to redirect current window to a given URL.
- `!challenge` now redirects to the challenge URL in the current window.
- The order of the arguments for `!challenge` is now more flexible: `!challenge <user> <time> <variant>` or `!challenge <user> <variant> <time>` and variant and time are optional, defaulting to standard and 5+3.
- Added the ability to schedule commands to run at a specific time. Thanks @fitztrev!
- Added `!commentary` owner command to get some commentary on the current BBB tournament. Thanks @fitztrev!

#### Bug Fixes

- Fixed a bug where `!challenge` was not outputting the challenge URL.

#### Breaking Changes

- Major underlying framework update: NestJS to 11.0

### 2.9.0 (2025-01-09)

#### Features

- Switched to SWC for infinitely faster builds.
- Added `!skeet` command to post to Bluesky.
- Added `!apod` command to display the NASA APOD for a given date.

#### Breaking Changes

- Removes temp files at startup.

#### Bug Fixes

- Fixed an issue with `!personality` where the personality was being appended to the response instead of being applied to the response. (prompt fix)
- Fixed a bug where bought squares were disappearing after the board was replaced.
- Fixed a bug where Discord service was crashing because of the 4000 character limit.
- Updated all packages to the latest versions and added an override for `path-to-regexp` to fix a high vulnerability with the `@nestjs/serve-static` package.
- Added more eslint rules to the project.
- TONS of code cleanup and type fixes.

### 2.8.0

#### Features

- Added Bluesky support.

#### Breaking Changes

- Removed Twitter support.

### 2.7.1

#### Bug Fixes

- Fix potential undefined errors in lichess performance ratings during good user checks

### 2.7.0

#### Features

- Added a script to make galleries out of kings, opponent kings, etc.
- Added a config option for entering the URLs of the those galleries and to use that link if it exists instead of outputting all the names in twitch.
- `!accept` now returns a reason for not accepting a user into the team.
- Rejecting users from `!accept` when puzzle rating is > 1000 over their max game rating or if their account is less than 30 days old.

#### Bug Fixes

- Fixed a bug with adding `@` in a user's name with `!shoutout` command.
- Fixed an issue where the Spotify service now also returns 200 when a song is found.

### 2.6.0

#### Breaking Changes

- Update to the UI extension required for new features.

#### Features

- Added ability to colored squares over the board with a new `SHAPE` socket event.
- Added a script that takes 8x8 pixel art images and turns it into an object that can be passed to the `SHAPE` event.
- Added a `!shape` owner command to send the pixel art to the board. Can be used in Twitch rewards or by the owner.
- Added a script to quickly resize images for the custom rewards icon.
- Trivia questions now automatically append "Closest wins!" and the number of seconds to guess if either of those options are set.
- Trivia now allows multiple correct answers from different users within 3 seconds of the first correct answer. (Except for closest to questions.)
- Added a new trivia command: `!trivia random` which returns a random user from the leaderboard
- Lots of package updates.

#### Bug Fixes

- Fixed board selector css class after lichess UI changes caused the board to lose its opacity.
- Fixed BlunderbotMenu scrolling.
- Fixed a bug where users were able to enter any username for the `!buy` command via channel redemption.

### 2.5.0

#### Features

- Added `!say` as an alias for `!tts`
- In the twitch simple commands UI, {username} and {message} can be used to replace the username and message in both any "commands" being set up or the "message" field.
- New wordle wordlist more closely matches the actual wordle wordlist.
- `!challenge` now accepts variant types like `!challenge user 5+3 chess960` with `standard` being the default.
- `openai.embeddingsModel` added to the config and openai service to support future commands utilizing embeddings.
- Update blunder report analysis tool to more closely reflect lichess analysis.
- Make it easier to add points with the trivia command, now either `!trivia add 10 user` or `!trivia add user 10` will work.
- 1.5x points in `!trivia` for getting a "Closest to" answer exactly right.
- The zerkin report! Thanks @fitztrev!

#### Bug Fixes

- Fixed a bug where AI responses including "\n" would be sent in several messages on twitch.

### 2.4.1

#### Bug Fixes

- Fixed a bug where local gifs weren't showing up after the file extension change in 2.4.0.
- Only owner should be able to run `!image` and `!background` command from Discord.

### 2.4.0 (2024-03-19)

#### Breaking Changes

- Sending the whole filename including extension to the frontend to support multiple file types, like gifs, for kings and opponent kings.

#### Features

- Added owner command for `!queue rotate` to move the current user to the end of the queue.
- BlunderBot now sends a message in `!accept` when there are no team requests to accept.
- A vchat trivia recap thanks @fitztrev!
- Owners can now pass `!t##` in `!songrequest` to change the max limit of that song request.

#### Bug Fixes

- Fixed a potential crash in the twitch eventsub when there's no response for subscriptions.
- With the addition of gif kings, was able to take out most of the hardcoded king css styles in the frontend.
- Fixed a bug in the `!followage` command.
- Package updates.

### 2.3.0

#### Features

- Added `!background` command and `background.html` browser source for OBS.
- Added `json_object` response to ensure OpenAI responds with a JSON object when required.

#### Bug Fixes

- Fixed a bug where the command service was crashing if limited or restricted commands weren't set in the config.
- Fixed README instructions for adding browser sources to OBS. Can't use https for local files with OBS.

### 2.2.0

#### Features

- Added `!random` command.

#### Bug Fixes

- Fixed a problem with the spotify service where the 2nd refresh of the access token was failing.
- Fixed a bug where we were using botspeak in several commands when those commands were disabled instead of logging to the console.

### 2.1.2 (2024-02-26)

#### Features

- Add ability to edit messages for discord. Improves the feedback of the `!violators` command. Thanks for the idea @fitztrev!

#### Bug Fixes

- Fixed a crash happening when the heart rate page doesn't load properly.
- Fixed a problem where the `commandState` wasn't initialized before the twitch service, causing a race condition problem with already connected sockets.
- Minor package updates and code cleanup

### 2.1.1 (2024-02-23)

#### Bug Fixes

- Fixed problem with initial config setup from empty database.
- Fixed division by zero error in Blunder Report when a player has no moves.

### 2.1.0 (2024-02-21)

#### Features

- New `!restart <service>` command to restart certain services like `!restart twitch` which will reestablish pubsub/eventsub connections. Especially helpful on the rare occasion that the pubsub connection drops so you don't need to restart the bot.

#### Bug Fixes

- Fixed a bug in `!title` where the bot was sending one title per message. The new chat endpoint was taking `\n` as a newline where it was ignored before.
- Fixed a bug where `!vchat` was sending replies to the owner.
- Fixed vulnerable dependencies and removed unused packages.
- Fixed a bug where founders weren't getting marked as subscribers.

### 2.0.0 (2024-02-20)

#### Breaking Changes

- Major configuration change. BlunderBot config now managed by BlunderBot-Admin

#### Bug Fixes

- `!sr` will not return karaoke tracks unless karaoke is in the search query.
- Fixed a bug where `!trivia start` would reset the trivia state if it was already started.

### 1.10.3

#### Features

- Added a reason to the `!violators` command. Thanks @fitztrev!

#### Bug Fixes

- `twitch.botPassword` no longer needed in config after removing tmi.js.
- Fixed problem in `!define` when word only has one definition.
- Fixed problem with `!poll cancel` command.
- Fixed no moderation in `!tts` command.
- Fixed problem with return type of queued commands.

### 1.10.2

#### Features

- Added a `POST /api/twitch/custom-reward` endpoint to add a custom reward using the same client ID as the bot. This is necessary to allow the bot to edit custom rewards (like enabling/disabling).
- Added an optional `twitch.challengeRewardId` to the config. If set, owner will now be able to run `!queue open` and `!queue close` to enable/disable the queue using the challenge reward.
- Added `!queue clear` to clear the entire challenge queue.
- Added `!emote` to easily toggle between emote only and not emote only chat. This will also allow for easy integration into the extension with an emote only button.
- Removed the `!cancel` command as it was too ambiguous. Replaced by `!poll cancel`.
- Added `!autoshoutout` command to clean up twitch service. This checks to see if the user is on the auto shoutout list and hasn't been auto shouted out yet, then does it.
- Added `!define <word>` and auto `!define <word>` after a round of wordle.

#### Bug Fixes

- Fixed a bug in `!opp` and `!king` where a user could change to a secret king.
- Now catching errors in `!image` creation and letting the user know their request failed.
- Make chat `!personality` clearer in the prompt.
- Fixed a bug where `!!` and `! ` were being treated as commands. Now only `!` followed by at least 1 alphanumeric character is treated as a command. Thanks @dannovikov @fitztrev!
- Type lichess response for `!bbb` command and limit tournaments returned to prevent lag in first use.
- Include missing sample database config.

### 1.10.1 (2024-02-05)

#### Features

- Added "random" as a square for `!buy` command. This will give a random available square on the board.

#### Bug Fixes

- Hardened `!buy` command. Moved logic out of twitch service and into the command file.
- vip, hypeTrainConductor, and founder badges weren't being added to the twitch context.

### 1.10.0 (2024-02-05)

#### Breaking Changes

- Optional database support has been added. See `src/config/db.config.sample.ts`. The database is necessary for running some commands, like `!addcom`.
  - Though database is optional, it's highly recommended. Version 2.0 of blunderbot will require database support for configuration and other things.
- `!add (!addcom_)` and `!delete (!delcom)` commands added for persistent commands. These commands require database support to work properly.

#### Features

- Added optional `discord.musicChannelId` to the config. If set and discord is enabled, song requests will be shared here with links to the track.
- Added optional `twitch.maxMessageLength` to the config. If set, messages over this length will fail instead of being split into multiple messages. Defaults to 1500 (3 twitch messages).

#### Bug Fixes

- Fixed a bug where the bot could have gotten stuck talking to itself in a loop.
- Fixed an issue where twitch bot messages over 500 characters were silently failing.

### 1.9.0 (2024-02-01)

#### Breaking Changes

- Using the brand new twitch API for chat messages and removed tmi.js
- `!skipsong` removed from the sample config as an addon command and added as a real mod command that skips the song in the queue.

#### Features

- Spotify integration added!
- `!songrequest` (`!sr`) command added to add a song to the queue.
  - Songs can be added with a search query like `!sr never gonna give you up` or a spotify link like `!sr https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8?si=d47e660f9ba84ce6`.
- `!song` command added to show the current song.
- Owners can now add or replace points during trivia for a user with `!trivia add|replace <username> <points>`. Case insensitive.
- Much better typing for twitch events and other code cleanup.
- Added `vipCommands`, `hypeTrainConductorCommands`, and `founderCommands` as optional arrays to the twitch config for more granular control over who can run commands.
- Added an `!8ball` command to ask the magic 8 ball a question.
- Added the src/command-overrides directory to the .gitignore file so people can add their own private commands or copy/paste/edit existing BlunderBot commands without tracking them in git.

#### Bug Fixes

- When using the twitch reply method, the bot should respond to the user that triggered the command via `onBehalfOf` if it's set.
- Fixed `!help` when no command is provided.
- Fixed `!trivia next` breaking on the last question.

### 1.8.1 (2024-01-30)

#### Features

- New !wordle command to play wordle with the chat.

#### Bug Fixes

- Fixed Context.reply methods for twitch and discord.
- Capped discord replies from openai as discord will fail on large messages.
- Fixed `!poll` not sending the entire prompt.
- More code cleanup.

### 1.8.0 (2024-01-29)

#### Breaking Changes

- Package updates, type fixes and lots of code cleanup. Thanks @fitztrev!
- `!reload` command removed and related `requireCache` util. Will find another way in the future.

#### Features

- Blunder Report added to the repo in `toos/`. Thanks @fitztrev!
- CI added to the repo. Thanks @fitztrev!

#### Bug Fixes

- Added `config.sample.ts`.
- Added the missing `config.gif.sample.ts`.
- Fixed some issues with non-required config crashing the bot when missing.
- OpenAI models not responding well to system messages. Attached some information, like personality, to user messages to help with this.

### 1.7.0 (2024-01-26)

#### Breaking Changes

- Major code cleanup and package updates thanks to @fitztrev!

### 1.6.0 (2024-01-23)

#### Breaking Changes

- Major configuration change. See README.md for more details.
- REMOVING THE NEED FOR A PROXY!!!!! See README.md for more details. HUGE shoutout to @dannovikov for resolving issue #2!
- `!reload` command currently not working because of how nestjs is caching files (even node's delete require.cache isn't working). Will fix in a future release.

#### Bug Fixes

- Hype train progress fixed to trigger on a new level, not every time the progress increases.

### 1.5.1 (2024-01-22)

#### Features

- Rewrote internal config handling to allow for `!reload` command. Now you can make changes to most sections of the config (like new message commands), add new kings and other public files, and fix other config typos without restarting the server. Just `!reload` the config.
- `!violators` command can now take a lichess team id to find violators in other teams.
- Added `!draw` as an alias to `!image`.
- BlunderBot gives a 3, 2, 1 countdown before the next trivia question is asked.
- Added `!trivia fastest` command to show the fastest answer during trivia.
- Added `twitch.eventWebsocketUrl` and `twitch.eventSubscriptionUrl` to the config for use with the twitch cli for debugging. Not required fields (no breaking changes).
- Now listening to train events. Will automagically run `!train` owner command when a hype train begins or progresses.
- Most events have been moved from tmi.js to eventSub or pubSub. Unfortunately, resubscribe and some other events are not at parity with pubSub yet, so more updates needed. CLOSE to removing tmi.js dependency.

#### Bug Fixes

- Owner/Bot ID should be strings in the config. Fixed the sample config and for now, ensure they're strings in the config service to avoid breaking changes.
- Fixed an issue where new followers weren't getting access to follower-only commands because of a caching issue.

### 1.5.0 (2024-01-15)

#### Breaking Changes

- Blunder Alerts have gotten a face lift.
- Renamed the owner commands `bits`, `raids`, `subs`, to `onbits`, `onraids`, `onsubs` to avoid confusion with other commands and to show that they're typically run on events.

#### Bug Fixes

- `twitch.onSubscribe` now works properly when a sub event happens

#### Features

- Added a `!trivia` command and a `trivia` config section.

### 1.4.0 (2024-01-11)

#### Breaking Changes

- Added `openai.enabled` to the `config.yml` file.
- Removed the `!party`, `!resign`, `!skipsong`, `!train`, `!trophy` commands as they can now be easily reproduced in the config. See the new feature for `messageCommands`.

#### Bug Fixes

- Fixed a bug where the `!kill` and `!toggle` commands weren't working properly with command abbreviations.
- Fixed a bug where just a `!` message was killing the bot. RIP.
- Fixed a bug where the `!image` command wasn't sending the image to discord when it should.
- Fixed a bug where `!opp-rating` wasn't working properly.

#### Features

- Added a `!socket` owner command to test socket connections and for sending messages to the app socket for things like custom rewards without having to create a special command each time.
- Added `twitch.onSubscribe` to the `config.yml` file for a list of commands to run during a twitch subscription event.
- `!sound` can now take a filepath instead of just sounds restricted to the soundboard.
- A new `!cursor` command that changes the cursor while it's over the board. Shoutout to @fitztrev for the contribution!
- `!version` command to display the current version of the bot. Thanks to @fitztrev for the contribution!
- `!end` now resets the entire command state 5 minutes after the command is used (so it doesn't reset limits, etc while the stream is wrapping up.)
- Now large parts of the config can be removed if unused. For example, if you don't want to use the `!image` command, you can remove the `openai` section from the config instead of just setting `enabled` to false.
- `messageCommands` in the config can now take an array of owner run commands. This allows for slightly more complicated command groupings. See the `party` and `train` commands in the `config.yml` for an example.

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
