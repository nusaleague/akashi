const requireAll = require('../lib/require-all');

module.exports = ctx => {
  const {app} = ctx;
  requireAll('./routes/*.js').forEach(createRoute => app.use(createRoute(ctx)));
};
