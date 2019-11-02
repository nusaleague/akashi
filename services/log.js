const pino = require('pino');

module.exports = {
  name: 'log',
  init({env}) {
    return pino({
      name: env.LOG_NAME,
      level: env.LOG_LEVEL,
      serializers: pino.stdSerializers,
      prettyPrint: env.dev ? {translateTime: 'SYS:HH:MM:ss.l'} : false
    });
  }
};
