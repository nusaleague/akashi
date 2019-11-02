const {serviceManager} = require('../lib/service');

module.exports = ({app}) => {
  const log = serviceManager.get('log');

  app.all('*', (req, res) => {
    log.debug({req}, `Route not found: ${req.originalUrl}`);
    res.sendStatus(404);
  });
};
