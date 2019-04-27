const _ = require('lodash')
const conn = require('../lib/database')

exports.computeMatchHalfTimeResults = {
  auth(user) {
    return user.staff
  },
  async fn(comp, year, stage) {
    const matchResultRows = await conn('vote_response_match')
      .whereIn('response_id', function () {
        this.select('vote_response.id')
          .from('vote_response')
          .join('vote_fixture', 'vote_response.fixture_id', 'vote_fixture.id')
          .whereIn('fixture_id', function () {
            this.select('id')
              .from('vote_fixture')
              .where('comp', comp).andWhere('season', year).andWhere('stage', stage) // TODO Ganti kolom season jadi year
          })
          .andWhere('created_time', '<=', conn.raw('DATE_ADD(end_time, INTERVAL TIME_TO_SEC(TIMEDIFF(start_time, end_time))/2 SECOND)'))
      })
      .groupBy('mascot_id')
      .select(['match_id', 'mascot_id'])
      .count('mascot_id as vote')

    matchResultRows.forEach(matchResultRow => {
      const sumVote = _.sum(
        matchResultRows
          .filter(row => row.match_id === matchResultRow.match_id)
          .map(row => row.vote)
      )

      matchResultRow.score = (p => {
        switch (Math.sign(p - 50)) {
          case 1: return Math.floor(p)
          case -1: return Math.ceil(p)
          default: return p
        }
      })((matchResultRow.vote / sumVote) * 100)
    })

    const [{id: seasonId}] = await conn('season')
      .where('comp', comp).andWhere('year', year)
      .select('id')

    const matchMascotRows = await conn('match_mascot')
      .whereIn('match_id', function () {
        this.select('id')
          .from('match')
          .where('season_id', seasonId).andWhere('stage', stage)
      })
      .select(['match_id', 'mascot_id'])

    await conn.transaction(async trx => {
      await Promise.all(matchMascotRows.map(matchMascotRow => (async () => {
        const {vote, score} = matchResultRows.find(row => row.mascot_id === matchMascotRow.mascot_id) || {vote: 0, score: 0}

        await trx('match_mascot')
          .where('match_id', matchMascotRow.match_id).andWhere('mascot_id', matchMascotRow.mascot_id)
          .update({
            /* eslint-disable camelcase */
            half_vote: vote,
            half_score: score
            /* eslint-enable camelcase */
          })
      })()))
    })
  }
}

exports.resetMatchHalfTimeResults = {
  auth(user) {
    return user.staff
  },
  async fn(comp, year, stage) {
    const [{id: seasonId}] = await conn('season')
      .where('comp', comp).andWhere('year', year)
      .select('id')

    const matchMascotRows = await conn('match_mascot')
      .whereIn('match_id', function () {
        this.select('id')
          .from('match')
          .where('season_id', seasonId).andWhere('stage', stage)
      })
      .select(['match_id', 'mascot_id'])

    await conn.transaction(async trx => {
      await Promise.all(matchMascotRows.map(matchMascotRow => (async () => {
        await trx('match_mascot')
          .where('match_id', matchMascotRow.match_id).andWhere('mascot_id', matchMascotRow.mascot_id)
          .update({
            /* eslint-disable camelcase */
            half_vote: null,
            half_score: null
            /* eslint-enable camelcase */
          })
      })()))
    })
  }
}

exports.computeMatchFullTimeResults = {
  auth(user) {
    return user.staff
  },
  async fn(comp, year, stage) {
    const matchResultRows = await conn('vote_response_match')
      .whereIn('response_id', function () {
        this.select('vote_response.id')
          .from('vote_response')
          .join('vote_fixture', 'vote_response.fixture_id', 'vote_fixture.id')
          .whereIn('fixture_id', function () {
            this.select('id')
              .from('vote_fixture')
              .where('comp', comp).andWhere('season', year).andWhere('stage', stage) // TODO Ganti kolom season jadi year
          })
      })
      .groupBy('mascot_id')
      .select(['match_id', 'mascot_id'])
      .count('mascot_id as vote')

    matchResultRows.forEach(matchResultRow => {
      const sumVote = _.sum(
        matchResultRows
          .filter(row => row.match_id === matchResultRow.match_id)
          .map(row => row.vote)
      )

      matchResultRow.score = (p => {
        switch (Math.sign(p - 50)) {
          case 1: return Math.floor(p)
          case -1: return Math.ceil(p)
          default: return p
        }
      })((matchResultRow.vote / sumVote) * 100)
    })

    const [{id: seasonId}] = await conn('season')
      .where('comp', comp).andWhere('year', year)
      .select('id')

    const matchMascotRows = await conn('match_mascot')
      .whereIn('match_id', function () {
        this.select('id')
          .from('match')
          .where('season_id', seasonId).andWhere('stage', stage)
      })
      .select(['match_id', 'mascot_id'])

    await conn.transaction(async trx => {
      await Promise.all(matchMascotRows.map(matchMascotRow => (async () => {
        const {vote, score} = matchResultRows.find(row => row.mascot_id === matchMascotRow.mascot_id) || {vote: 0, score: 0}

        await trx('match_mascot')
          .where('match_id', matchMascotRow.match_id).andWhere('mascot_id', matchMascotRow.mascot_id)
          .update({
            /* eslint-disable camelcase */
            full_vote: vote,
            full_score: score
            /* eslint-enable camelcase */
          })
      })()))
    })
  }
}

exports.resetMatchFullTimeResults = {
  auth(user) {
    return user.staff
  },
  async fn(comp, year, stage) {
    const [{id: seasonId}] = await conn('season')
      .where('comp', comp).andWhere('year', year)
      .select('id')

    const matchMascotRows = await conn('match_mascot')
      .whereIn('match_id', function () {
        this.select('id')
          .from('match')
          .where('season_id', seasonId).andWhere('stage', stage)
      })
      .select(['match_id', 'mascot_id'])

    await conn.transaction(async trx => {
      await Promise.all(matchMascotRows.map(matchMascotRow => (async () => {
        await trx('match_mascot')
          .where('match_id', matchMascotRow.match_id).andWhere('mascot_id', matchMascotRow.mascot_id)
          .update({
            /* eslint-disable camelcase */
            full_vote: null,
            full_score: null
            /* eslint-enable camelcase */
          })
      })()))
    })
  }
}

exports.getMatchData = {
  auth(user) {
    return user.staff
  },
  async fn(comp, year, stage) {
    const [{id: seasonId}] = await conn('season')
      .where('comp', comp).andWhere('year', year)
      .select('id')

    const data = {}

    data.matchMascot = await conn('match_mascot')
      .whereIn('match_id', function () {
        this.select('id')
          .from('match')
          .where('season_id', seasonId).andWhere('stage', stage)
      })
      .select(['match_id', 'mascot_id', 'half_score', 'full_score'])

    data.mascotSeasonRows = await conn('mascot_season')
      .where('season_id', seasonId)
      .select(['mascot_id', 'division'])

    data.mascotRows = await conn('mascot')
      .whereIn('id', function () {
        this.select('mascot_id')
          .from('mascot_season')
          .where('season_id', seasonId)
      })
      .select(['id', 'slug', 'short_name'])

    return data
  }
}

exports.getStandings = {
  auth(user) {
    return user.staff
  },
  async fn(comp, year) {
    const [{id: seasonId}] = await conn('season')
      .where('comp', comp).andWhere('year', year)
      .select('id')

    const data = {}

    data.standing = await conn(
      conn('mascot_season')
        .join('match_mascot', 'mascot_season.mascot_id', 'match_mascot.mascot_id')
        .whereNotNull('full_score')
        .whereIn('match_id', function () {
          this.select('id')
            .from('match')
            .where('season_id', seasonId).andWhere('stage', 'like', 'g%')
        })
        .groupBy('match_mascot.mascot_id')
        .select([
          'mascot_season.mascot_id',
          'mascot_season.division',
          conn.raw('sum(case when full_score > 50 then 1 else 0 end) as win'),
          conn.raw('sum(case when full_score = 50 then 1 else 0 end) as draw'),
          conn.raw('sum(case when full_score < 50 then 1 else 0 end) as lose')
        ])
        .sum('full_score as score')
        .as('sub')
    ).select(['*', conn.raw('(3 * win + draw) AS points')])

    data.mascot = await conn('mascot')
      .whereIn('id', function () {
        this.select('mascot_id')
          .from('mascot_season')
          .where('season_id', seasonId)
      })
      .select(['id', 'slug', 'short_name'])

    return data
  }
}
