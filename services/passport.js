const { Passport } = require('passport');
const { serviceManager } = require('../lib/service');

module.exports = {
  name: 'passport',
  init() {
    const User = serviceManager.get('models/user');

    const passport = new Passport();

    passport.serializeUser((user, next) => {
      if (!user.id) {
        next(new Error('Invalid user object for serialization'));
        return;
      }

      return next(null, user.id);
    });

    passport.deserializeUser((id, next) => {
      (async () => {
        const user = await User.findById(id);
        if (!user) {
          next(new Error(`Invalid user id for deserialization: ${id}`));
          return;
        }

        next(null, await user.getPassportData());
      })().catch(next);
    });

    passport.use('local', serviceManager.get('passport-strategy/local'));
    passport.use('facebook', serviceManager.get('passport-strategy/facebook'));
    passport.use('google', serviceManager.get('passport-strategy/google'));

    return passport;
  }
};
