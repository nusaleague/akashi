const {serviceManager} = require('../lib/service');

module.exports = {
  name: 'getFullTimeResult',
  async fn(comp, year, stage) {
    const db = serviceManager.get('database');

    const [{id: seasonId}] = await db('season')
      .where('comp', comp).andWhere('year', year)
      .select('id');

    const data = {};

    data.matchMascot = await db('match_mascot')
      .whereIn('match_id', function () {
        this.select('id')
          .from('match')
          .where('season_id', seasonId).andWhere('stage', stage);
      })
      .select(['match_id', 'mascot_id', 'full_score']);

    for (const matchMascot of data.matchMascot) {
      if (matchMascot.full_score === null) {
        return null;
      }
    }

    data.mascotSeasonRows = await db('mascot_season')
      .where('season_id', seasonId)
      .select(['mascot_id', 'division']);

    data.mascotRows = await db('mascot')
      .whereIn('id', function () {
        this.select('mascot_id')
          .from('mascot_season')
          .where('season_id', seasonId);
      })
      .select(['id', 'slug', 'short_name']);

    return data;
  }
};
