const knex = require('knex')
const {loadEnv} = require('../env')

function createConnection(connection = {}) {
  return knex({
    client: 'mysql',
    connection: {
      nestTables: true,
      ...connection
    }
  })
}
exports.createConnection = createConnection

const connection = (() => {
  loadEnv()

  const {
    MYSQL_HOST: host,
    MYSQL_PORT: port,
    MYSQL_USER: user,
    MYSQL_PASS: password,
    MYSQL_NAME: database
  } = process.env

  return createConnection({
    host, port, user, password, database,
    nestTables: true
  })
})()
exports.connection = connection
