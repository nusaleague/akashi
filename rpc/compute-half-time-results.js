const _ = require('lodash');
const {serviceManager} = require('../lib/service');

module.exports = {
  name: 'computeHalfTimeResults',
  auth(user) {
    return user.staff;
  },
  async fn(comp, year, stage) {
    const db = serviceManager.get('database');

    const matchResultRows = await db('vote_response_match')
      .whereIn('response_id', function () {
        this.select('vote_response.id')
          .from('vote_response')
          .join('vote_fixture', 'vote_response.fixture_id', 'vote_fixture.id')
          .whereIn('fixture_id', function () {
            this.select('id')
              .from('vote_fixture')
              .where('comp', comp).andWhere('season', year).andWhere('stage', stage); // TODO Ganti kolom season jadi year
          })
          .andWhere('created_time', '<=', db.raw('DATE_ADD(end_time, INTERVAL TIME_TO_SEC(TIMEDIFF(start_time, end_time))/2 SECOND)'));
      })
      .groupBy(['match_id', 'mascot_id'])
      .select(['match_id', 'mascot_id'])
      .count('mascot_id as vote');

    matchResultRows.forEach(matchResultRow => {
      const sumVote = _.sum(
        matchResultRows
          .filter(row => row.match_id === matchResultRow.match_id)
          .map(row => row.vote)
      );

      matchResultRow.score = (p => {
        switch (Math.sign(p - 50)) {
          case 1: return 51;
          case -1: return 49;
          default: return p;
        }
      })((matchResultRow.vote / sumVote) * 100);
    });

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
      await Promise.all(matchMascotRows.map(
        matchMascotRow => (async () => {
          const {vote, score} = matchResultRows.find(row => row.mascot_id === matchMascotRow.mascot_id) || {vote: 0, score: 0};

          await trx('match_mascot')
            .where('match_id', matchMascotRow.match_id).andWhere('mascot_id', matchMascotRow.mascot_id)
            .update({
              /* eslint-disable camelcase */
              half_vote: vote,
              half_score: score
              /* eslint-enable camelcase */
            });
        })()
      ));
    });
  }
};
