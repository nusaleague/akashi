const knex = require('knex')

const {
  MYSQL_HOST: host,
  MYSQL_PORT: port,
  MYSQL_USER: user,
  MYSQL_PASS: password,
  MYSQL_NAME: database
} = process.env

const connection = knex({
  client: 'mysql',
  connection: {host, port, user, password, database}
})

module.exports = connection
