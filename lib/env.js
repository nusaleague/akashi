const dotenv = require('dotenv')

dotenv.config({path: './.env'})

if (process.env.NODE_ENV) {
  dotenv.config({path: `./${process.env.NODE_ENV}.env`})
}

dotenv.config({path: './default.env'})

const {NODE_ENV: ENV} = process.env
exports.ENV = ENV

const DEVELOPMENT = ENV === 'development'
exports.DEVELOPMENT = DEVELOPMENT

const PRODUCTION = ENV === 'production'
exports.PRODUCTION = PRODUCTION

const TEST = ENV === 'TEST'
exports.TEST = TEST

const {PORT} = process.env
exports.PORT = PORT

const {BASE_URL = `http://localhost:${PORT}`} = process.env
exports.BASE_URL = BASE_URL
