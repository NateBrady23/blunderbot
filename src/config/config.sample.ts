/**
 * This is the minimal configuration for BlunderBot. BlunderBot needs a database to run. Once connected,
 * you will need to use BlunderBot Admin (https://www.blunder.bot) to configure the bot to your liking.
 */
const config: UserConfig = {
  // If you change either of these ports, you'll have to manually change them in
  // in files in the public folder. BlunderBot uses port 3000 for http communication
  // in browser source files because of limitations in OBS. It uses port 3001 for websockets
  // for the same reason. Hoping to keep this to one port in the future, but for now, NestJS
  // doesn't make multiple websocket adapters easy. Port 443 is used for https for the extension
  // to work.
  port: 3000,
  wsPort: 3001,

  db: {
    enabled: true,
    type: 'mysql',
    host: 'aws.connect.psdb.cloud',
    // port: 3000,
    username: 'my_username',
    password: 'my_password',
    database: 'blunderdb',

    // Always run migrations on startup unless you are doing migration development
    migrationsRun: true,

    extra: {
      ssl: {
        rejectUnauthorized: true
      }
    }
  }
};

export default config;
