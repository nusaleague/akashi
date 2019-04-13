const dotenv = require('dotenv')

dotenv.config({path: './.env'})
dotenv.config({path: './default.env'})

const {NODE_ENV: ENV} = process.env

const DEVELOPMENT = ENV === 'development'

const PRODUCTION = ENV === 'production'

const TEST = ENV === 'TEST'

module.exports = {
  ENV,
  DEVELOPMENT,
  PRODUCTION,
  TEST
}
