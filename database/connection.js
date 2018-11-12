const knex = require('knex');

const {
  MYSQL_HOST: host = 'localhost',
  MYSQL_PORT: port = 3306,
  MYSQL_USER: user,
  MYSQL_PASS: password,
  MYSQL_NAME: database
} = process.env;

const connection = knex({
  client: 'mysql',
  connection: {
    host,
    port,
    user,
    password,
    database
  }
});

module.exports = connection;
