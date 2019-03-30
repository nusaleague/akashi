const _ = require('lodash')
const moment = require('moment')
const {default: ow} = require('ow')
const conn = require('../lib/database/connection')
const err = require('../lib/rpc/error')
const {asSelf} = require('../lib/rpc/auth')

exports.getFixture = {
  auth: asSelf(),
  validateArgs(userId, fixtureSlug) {
    ow(userId, ow.number.uint32)
    ow(fixtureSlug, ow.string)
  },
  async fn(userId, fixtureSlug) {
    const [fixture] = await conn('vote_fixture')
      .where('slug', fixtureSlug)

    if (!fixture) {
      return null
    }

    const data = {}

    const status = getFixtureStatus(fixture)
    if (status === null) {
      return null
    }

    data.status = status

    // eslint-disable-next-line camelcase
    data.vote_fixture = _.pick(fixture, ['id', 'slug', 'comp', 'season', 'stage', 'start_time', 'end_time'])

    if (!status) {
      return data
    }

    // eslint-disable-next-line camelcase
    data.vote_match = await conn('vote_match')
      .where('fixture_id', fixture.id)
      .select(['id', 'division'])

    // eslint-disable-next-line camelcase
    data.vote_match_mascot = await conn('vote_match_mascot')
      .whereIn('match_id', _.map(data.vote_match, 'id'))
      .select(['match_id', 'mascot_id'])

    data.mascot = await conn('mascot')
      .whereIn('id', _.map(data.vote_match_mascot, 'mascot_id'))
      .select(['id', 'org_id', 'slug', 'short_name', 'color_hex', 'description'])

    data.org = await conn('org')
      .whereIn('id', _.uniq(_.map(data.mascot, 'org_id')))
      .select(['id', 'slug', 'short_name'])

    // eslint-disable-next-line camelcase
    data.vote_response = await conn('vote_response')
      .where('fixture_id', fixture.id).andWhere('user_id', userId)
      .select(['id', 'fixture_id', 'user_id', 'created_time', 'comment'])

    return data
  }
}

exports.submitResponse = {
  auth: asSelf(),
  validateArgs(userId, fixtureId, submitData) {
    ow(userId, ow.number.uint32)
    ow(fixtureId, ow.number.uint32)
    ow(submitData, ow.object.exactShape({
      comment: ow.optional.any(ow.string.nonEmpty, ow.nullOrUndefined),
      responses: ow.array.ofType(ow.object.exactShape({
        matchId: ow.number.uint32,
        mascotId: ow.number.uint32
      }))
    }))
  },
  async fn(userId, fixtureId, submitData) {
    const [fixture] = await conn('vote_fixture').where('id', fixtureId)

    if (!fixture || !getFixtureStatus(fixture)) {
      throw new err.IllegalOperationError()
    }

    const matchMascots = await conn('vote_match_mascot')
      .whereIn('match_id', function () {
        this('vote_match').where('fixture_id', fixtureId).select('id')
      })
      .select('match_id', 'mascot_id')

    const matchMascotMaps = _.mapValues(
      _.groupBy(matchMascots, 'match_id'),
      matchMascot => _.map(matchMascot, 'mascot_id')
    )

    if (submitData.responses.length !== Object.keys(matchMascotMaps).length) {
      throw new err.InvalidInputError()
    }

    for (const {matchId, mascotId} of submitData.responses) {
      const {[matchId]: map} = matchMascotMaps
      if (!map || !map.includes(mascotId)) {
        throw new err.InvalidInputError()
      }
    }

    await conn.transaction(async trx => {
      let result
      try {
        result = await trx('vote_response').insert({
          /* eslint-disable camelcase */
          fixture_id: fixtureId,
          user_id: userId,
          comment: submitData.comment || null
          /* eslint-enable camelcase */
        })
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new err.InvalidInputError()
        }

        throw error
      }

      const [responseId] = result
      await trx('vote_response_match').insert(
        submitData.responses.map(response => ({
          /* eslint-disable camelcase */
          response_id: responseId,
          match_id: response.matchId,
          mascot_id: response.mascotId
          /* eslint-enable camelcase */
        }))
      )
    })
  }
}

function getFixtureStatus(voteFixture) {
  const {
    override_open: override,
    start_time: start,
    end_time: end
  } = voteFixture

  if (override) {
    return true
  }

  if (start !== null) {
    if (moment().isBefore(start)) {
      return null
    }
  }

  if (end !== null) {
    if (moment().isAfter(end)) {
      return false
    }
  }

  return false
}
