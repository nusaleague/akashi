const {serviceManager} = require('../lib/service');

module.exports = ({app}) => {
  const log = serviceManager.get('log');

  app.use((err, req, res, next) => {
    if (err.__isFromJSONRPC) {
      log.error({req}, 'Invalid JSON for JSON-RPC request');
      res.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          message: 'Parse error',
          code: -32700
        }
      });
      return;
    }

    next(err);
  });
};
