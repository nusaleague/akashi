const { Router: router } = require('express');
const { default: ow } = require('ow');
const handle = require('../utils/middlewares/handle');
const validate = require('../utils/middlewares/validate');
const AuthController = require('../controllers/auth');
const passport = require('../utils/passport');

const route = router();

route.get(
  '/auth',
  handle(req => req.user)
);

route.post('/auth', [
  validate(req => {
    ow(
      req.body,
      ow.object.partialShape({
        name: ow.string.nonEmpty,
        password: ow.string.nonEmpty
      })
    );
  }),
  handle(async req => {
    const {
      body: { name, password }
    } = req;

    const user = await AuthController.authByPassword(name, password);

    await new Promise((resolve, reject) => {
      req.login(user, err => (err ? reject(err) : resolve()));
    });

    return user;
  })
]);

route.get('/auth/facebook', passport.authenticate('facebook'));

route.get('/auth/facebook/callback', [
  passport.authenticate('facebook'),
  (req, res) => {
    res.redirect(process.env.AUTH_REDIRECT);
  }
]);

route.get('/auth/google', passport.authenticate('google'));

route.get('/auth/google/callback', [
  passport.authenticate('google'),
  (req, res) => {
    res.redirect(process.env.AUTH_REDIRECT);
  }
]);

route.delete(
  '/auth',
  handle(req => {
    req.logout();
  })
);

module.exports = route;
