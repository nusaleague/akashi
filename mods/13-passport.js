const { serviceManager } = require('../lib/service');

module.exports = ({ app }) => {
  const passport = serviceManager.get('passport');

  app.use(passport.initialize());
  app.use(passport.session());
};
