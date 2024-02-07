/**
 * Not required
 *
 * Only needed right now for a few commands, but the database will be required in Version 2.0 of BlunderBot.
 */
const userDbConfig: UserDbConfig = {
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
};

export default userDbConfig;
