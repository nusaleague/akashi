const {serviceManager} = require('../lib/service');

module.exports = {
  name: 'resetFullTimeResults',
  auth(user) {
    return user.staff;
  },
  async fn(comp, year, stage) {
    const db = serviceManager.get('database');

    const [{id: seasonId}] = await db('season')
      .where('comp', comp).andWhere('year', year)
      .select('id');

    const matchMascotRows = await db('match_mascot')
      .whereIn('match_id', function () {
        this.select('id')
          .from('match')
          .where('season_id', seasonId).andWhere('stage', stage);
      })
      .select(['match_id', 'mascot_id']);

    await db.transaction(async trx => {
      await Promise.all(matchMascotRows.map(matchMascotRow => (async () => {
        await trx('match_mascot')
          .where('match_id', matchMascotRow.match_id).andWhere('mascot_id', matchMascotRow.mascot_id)
          .update({
            /* eslint-disable camelcase */
            full_vote: null,
            full_score: null
            /* eslint-enable camelcase */
          });
      })()));
    });
  }
};
