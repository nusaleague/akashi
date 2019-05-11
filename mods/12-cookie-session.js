const cookieSession = require('cookie-session');
const {serviceManager} = require('../lib/service');

module.exports = ({app, env: {SECRET: secret, dev}}) => {
	const log = serviceManager.get('log');

	if (!dev && secret === 'DEFAULT_SECRET') {
		log.warn('Using default secret string DEFAULT_SECRET in non-development environment');
	}

	app.use(cookieSession({
		secret,
		maxAge: 14 * 24 * 3600 * 1000,
		sameSite: 'lax'
	}));
};
