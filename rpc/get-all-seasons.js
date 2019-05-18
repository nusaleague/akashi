const {serviceManager} = require('../lib/service');

module.exports = {
	name: 'getAllSeasons',
	async fn() {
		const db = serviceManager.get('database');

		const data = await db('season').select(['comp', 'year']);
		return data;
	}
};
