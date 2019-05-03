const {serviceManager} = require('../lib/service');

module.exports = {
	name: 'getStandings',
	auth(user) {
		return user.staff;
	},
	async fn(comp, year) {
		const db = serviceManager.get('database');

		const [{id: seasonId}] = await db('season')
			.where('comp', comp).andWhere('year', year)
			.select('id');

		const data = {};

		data.standing = await db(
			db('mascot_season')
				.join('match_mascot', 'mascot_season.mascot_id', 'match_mascot.mascot_id')
				.whereNotNull('full_score')
				.whereIn('match_id', function () {
					this.select('id')
						.from('match')
						.where('season_id', seasonId).andWhere('stage', 'like', 'g%');
				})
				.groupBy('match_mascot.mascot_id')
				.select([
					'mascot_season.mascot_id',
					'mascot_season.division',
					db.raw('sum(case when full_score > 50 then 1 else 0 end) as win'),
					db.raw('sum(case when full_score = 50 then 1 else 0 end) as draw'),
					db.raw('sum(case when full_score < 50 then 1 else 0 end) as lose')
				])
				.sum('full_score as score')
				.count('match_id as matches')
				.as('sub')
		).select(['*', db.raw('(3 * win + draw) AS points')]);

		data.mascot = await db('mascot')
			.whereIn('id', function () {
				this.select('mascot_id')
					.from('mascot_season')
					.where('season_id', seasonId);
			})
			.select(['id', 'slug', 'short_name', 'color_hex']);

		return data;
	}
};
