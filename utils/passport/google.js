const { Strategy } = require('passport-google-oauth20');
const AuthController = require('../../controllers/auth');

module.exports = new Strategy(
  {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    enableProof: true,
    scope: ['profile', 'email']
  },
  (accessToken, refreshToken, profile, next) => {
    (async () => {
      const { id, _json: info } = profile;

      const user = await AuthController.authBySocial('google', id, info);
      next(null, user);
    })().catch(next);
  }
);
