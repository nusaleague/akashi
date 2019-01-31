const path = require('path')
const dotenv = require('dotenv')

function loadEnv() {
  dotenv.load({path: path.resolve('./.env')})

  if (getEnv() === 'test') {
    dotenv.load({path: path.resolve('./testing.env')})
  }

  dotenv.load({path: path.resolve('./default.env')})
}
exports.loadEnv = loadEnv

function getEnv() {
  return process.env.NODE_ENV || 'development'
}
exports.getEnv = getEnv

function isDevelopment() {
  return getEnv() === 'development'
}
exports.isDevelopment = isDevelopment

function isProduction() {
  return getEnv() === 'production'
}
exports.isProduction = isProduction

function isTest() {
  return getEnv() === 'test'
}
exports.isTest = isTest
