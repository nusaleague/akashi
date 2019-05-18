const {serviceManager} = require('../lib/service');

module.exports = {
	name: 'getAllFinishedStages',
	async fn(comp, year) {
		const db = serviceManager.get('database');

		const stages = await db('vote_fixture')
			.where('comp', comp)
			.andWhere('season', year)
			.andWhere('end_time', '<', db.fn.now())
			.distinct('stage')
			.map(row => row.stage);

		return stages;
	}
};
