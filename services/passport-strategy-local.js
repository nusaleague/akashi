const {Strategy} = require('passport-local');
const {serviceManager} = require('../lib/service');

module.exports = {
	name: 'passport-strategy/local',
	init() {
		const User = serviceManager.get('models/user');

		return new Strategy((name, password, next) => {
			(async () => {
				const user = await User.findByName(name);
				if (!user) {
					next(null, false);
					return;
				}

				const isPasswordCorrect = await user.testPassword(password);
				if (!isPasswordCorrect) {
					next(null, false);
					return;
				}

				next(null, user);
			})().catch(next);
		});
	}
};
