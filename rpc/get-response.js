const _ = require('lodash');
const {default: ow} = require('ow');
const {serviceManager} = require('../lib/service');

module.exports = {
	name: 'getResponse',
	auth(user, userId) {
		return user.id === userId;
	},
	validateArgs(userId, fixtureId) {
		ow(userId, ow.number.positive.uint32);
		ow(fixtureId, ow.number.positive.uint32);
	},
	async fn(userId, fixtureId) {
		const conn = serviceManager.get('database');

		const [response] = await conn('vote_response')
			.where('user_id', userId).andWhere('fixture_id', fixtureId);

		if (!response) {
			return null;
		}

		const data = {};

		// eslint-disable-next-line camelcase
		data.vote_response = _.pick(response, ['id', 'fixture_id', 'user_id', 'created_time', 'comment']);

		// eslint-disable-next-line camelcase
		data.vote_response_match = await conn('vote_response_match')
			.where('response_id', response.id)
			.select(['response_id', 'match_id', 'mascot_id']);

		return data;
	}
};
