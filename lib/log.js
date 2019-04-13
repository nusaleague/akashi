const bunyan = require('bunyan')
const {DEVELOPMENT} = require('./env')

const log = bunyan.createLogger({
  name: process.env.LOG_NAME,
  level: process.env.LOG_LEVEL,
  serializers: bunyan.stdSerializers,
  stream: DEVELOPMENT ? devStream() : process.stdout
})

module.exports = log

function devStream() {
  const PrettyStream = require('bunyan-prettystream')

  const stream = new PrettyStream()
  stream.pipe(process.stdout)

  return stream
}
