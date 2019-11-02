const {Strategy} = require('passport-google-oauth20');
const {serviceManager} = require('../lib/service');

module.exports = {
  name: 'passport-strategy/google',
  init({env}) {
    const User = serviceManager.get('models/user');

    const config = {
      clientID: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
      callbackURL: `${env.baseurl}/auth/google/callback`,
      scope: ['email', 'profile', 'openid']
    };

    return new Strategy(
      config,
      (accessToken, refreshToken, profile, next) => {
        (async () => {
          const {id, _json: info} = profile;
          next(null, await User.authenticateWithSocial('google', id, info));
        })().catch(next);
      }
    );
  }
};
