const { Strategy } = require('passport-facebook');
const AuthController = require('../../controllers/auth');

module.exports = new Strategy(
  {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
    enableProof: true,
    // TODO Investigasi kenapa scopenya nggak bisa
    scope: ['public_profile', 'email', 'user_friends']
  },
  (accessToken, refreshToken, profile, next) => {
    (async () => {
      const { id, _json: info } = profile;

      const user = await AuthController.authBySocial('facebook', id, info);
      next(null, user);
    })().catch(next);
  }
);
