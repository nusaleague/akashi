require('./utils/env').loadEnv();

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_NAME,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS
    },
    migrations: {
      tableName: '_knex_migrations'
    },
    asyncStackTraces: true
  },
  production: {
    client: 'mysql',
    connection: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_NAME,
      user: process.env.MYSQL_MIGRATION_USER,
      password: process.env.MYSQL_MIGRATION_PASS
    },
    migrations: {
      tableName: '_knex_migrations'
    }
  }
};
