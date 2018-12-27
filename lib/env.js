const path = require('path')
const dotenv = require('dotenv')

dotenv.load({path: path.resolve('./.env')})

if (process.env.NODE_ENV === 'test') {
  dotenv.load({path: path.resolve('./testing.env')})
}

dotenv.load({path: path.resolve('./default.env')})

const env = process.env.NODE_ENV || 'development'
exports.env = env

const dev = env === 'development'
exports.dev = dev

const test = env === 'test'
exports.test = test
