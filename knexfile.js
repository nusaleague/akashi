const {createEnv} = require('./lib/env');

const env = createEnv();

module.exports = {
  client: 'mysql',
  connection: {
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASS,
    database: env.MYSQL_NAME
  },
  migrations: {
    tableName: '_knex_migrations'
  },
  asyncStackTraces: true,
  production: {
    client: 'mysql',
    connection: {
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_MIGRATION_USER,
      password: env.MYSQL_MIGRATION_PASS,
      database: env.MYSQL_NAME
    },
    asyncStackTraces: false
  }
};
