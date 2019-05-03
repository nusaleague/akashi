const {Strategy} = require('passport-facebook');
const {serviceManager} = require('../lib/service');

module.exports = {
	name: 'passport-strategy/facebook',
	init({env}) {
		const User = serviceManager.get('models/user');

		const config = {
			clientID: env.FACEBOOK_ID,
			clientSecret: env.FACEBOOK_SECRET,
			callbackURL: `${env.baseurl}/auth/facebook/callback`,
			enableProof: true
		};

		return new Strategy(
			config,
			(accessToken, refreshToken, profile, next) => {
				(async () => {
					const {id, _json: info} = profile;
					next(null, await User.authenticateWithSocial('facebook', id, info));
				})().catch(next);
			}
		);
	}
};
