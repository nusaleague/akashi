const { Passport } = require('passport');
const UserModel = require('../../models/user');
const facebookStrategy = require('./facebook');
const googleStrategy = require('./google');

const passport = new Passport();

passport.use('facebook', facebookStrategy);
passport.use('google', googleStrategy);

passport.serializeUser((user, done) =>
  (async () => {
    if (typeof user.id !== 'number') {
      throw new TypeError('Invalid user object for serialization');
    }

    done(null, user.id);
  })().catch(done)
);

passport.deserializeUser((id, done) => {
  (async () => {
    const user = await UserModel.findById(id);
    done(null, user || false);
  })().catch(done);
});

module.exports = passport;
