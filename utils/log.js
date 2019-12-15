const pino = require('pino');
const { isDevelopment } = require('../utils/env');

module.exports = pino({
  name: process.env.LOG_NAME,
  level: process.env.LOG_LEVEL,
  serializers: pino.stdSerializers,
  prettyPrint: isDevelopment() ? { translateTime: 'SYS:HH:MM:ss.l' } : false
});
