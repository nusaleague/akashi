const knex = require('knex');

module.exports = {
  name: 'database',
  init({ env }) {
    return knex({
      client: 'mysql',
      connection: {
        host: env.MYSQL_HOST,
        port: env.MYSQL_PORT,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASS,
        database: env.MYSQL_NAME
      }
    });
  }
};
