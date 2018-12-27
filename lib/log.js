const bunyan = require('bunyan')
const {dev} = require('./env')

const logger = bunyan.createLogger({
  name: process.env.LOG_NAME,
  level: process.env.LOG_LEVEL,
  serializers: {
    ...bunyan.stdSerializers
  },
  stream: (() => {
    if (!dev) {
      return process.stdout
    }

    const PrettyStream = require('bunyan-prettystream')

    const stream = new PrettyStream()
    stream.pipe(process.stdout)

    return stream
  })()
})

module.exports = logger
