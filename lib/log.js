const bunyan = require('bunyan')
const env = require('./env')

function createLogger(name, opts = {}) {
  const {
    level = env.isDevelopment() ? 'debug' : 'info',
    serializers = bunyan.stdSerializers,
    stream = process.stdout
  } = opts

  return bunyan.createLogger({name, level, serializers, stream})
}
exports.createLogger = createLogger

const log = (() => {
  env.loadEnv()

  const {LOG_NAME: name, LOG_LEVEL: level} = process.env

  const stream = (() => {
    if (env.isProduction()) {
      return process.stdout
    }

    const PrettyStream = require('bunyan-prettystream')

    const stream = new PrettyStream()
    stream.pipe(process.stdout)

    return stream
  })()

  return createLogger(name, {level, stream})
})()
exports.log = log

function createComponentLogger(component) {
  return log.child({component})
}
exports.createComponentLogger = createComponentLogger
