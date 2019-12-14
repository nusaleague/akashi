const { serviceManager } = require('../lib/service');

module.exports = ({ app }) => {
  const log = serviceManager.get('log');

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      log.fatal(
        { err, req, res },
        'Unhandled server error (headers already sent)'
      );
      next(err);
      return;
    }

    log.error({ err, req }, 'Unhandled server error');
    res.sendStatus(500);
  });
};
