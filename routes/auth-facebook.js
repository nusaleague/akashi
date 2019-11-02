const {Router: router} = require('express');
const {serviceManager} = require('../lib/service');

module.exports = ({env: {authRedirect}}) => {
  const passport = serviceManager.get('passport');
  const log = serviceManager.get('log');

  const route = router();

  route.get('/auth/facebook',
    (req, res, next) => {
      req.session.next = req.query.next;
      next();
    },
    passport.authenticate('facebook')
  );

  route.get('/auth/facebook/callback',
    (req, res, next) => {
      log.debug({req}, 'Facebook auth callback');
      next();
    },
    passport.authenticate('facebook'),
    (req, res) => {
      const url = authRedirect[req.session.next];
      delete req.session.next;

      if (url) {
        res.redirect(url);
        return;
      }

      res.render('auth-callback');
    }
  );

  return route;
};
