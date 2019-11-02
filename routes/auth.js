const {Router: router, json} = require('express');
const {serviceManager} = require('../lib/service');

module.exports = () => {
  const passport = serviceManager.get('passport');

  const route = router();

  route.get('/auth', (req, res) => {
    res.json(req.user || null);
  });

  route.get('/auth/logout', (req, res) => {
    req.logout();
    res.sendStatus(204);
  });

  route.post('/auth',
    json(),
    (req, res, next) => passport.authenticate('local', (err, user) => {
      if (err) {
        next(err);
        return;
      }

      if (!user) {
        res.sendStatus(401);
        return;
      }

      req.login(user, err => {
        if (err) {
          next(err);
          return;
        }

        res.sendStatus(200);
      });
    })(req, res, next)
  );

  return route;
};
