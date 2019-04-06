const _ = require('lodash')
const moment = require('moment')
const {default: ow} = require('ow')
const conn = require('../lib/database/connection')
const err = require('../lib/error')

exports.getFixture = {
  auth: true,
  validateArgs(fixtureSlug) {
    try {
      ow(fixtureSlug, ow.string.nonEmpty)
    } catch (error) {
      return false
    }

    return true
  },
  async fn(fixtureSlug) {
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
      .select([
        'id',
        'division'
      ])

    // eslint-disable-next-line camelcase
    data.vote_match_mascot = await conn('vote_match_mascot')
      .whereIn('match_id', _.map(data.vote_match, 'id'))
      .select([
        'match_id',
        'mascot_id'
      ])

    data.mascot = await conn('mascot')
      .whereIn('id', _.map(data.vote_match_mascot, 'mascot_id'))
      .select(['id', 'org_id', 'slug', 'short_name', 'color_hex', 'description'])

    data.org = await conn('org')
      .whereIn('id', _.uniq(_.map(data.mascot, 'org_id')))
      .select(['id', 'slug', 'short_name'])

    return data
  }
}

exports.getResponse = {
  auth(user, userId) {
    return user.id === userId
  },
  validateArgs(userId, fixtureId) {
    try {
      ow(userId, ow.number.positive.uint32)
      ow(fixtureId, ow.number.positive.uint32)
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userId, fixtureId) {
    const [response] = await conn('vote_response')
      .where('user_id', userId).andWhere('fixture_id', fixtureId)

    if (!response) {
      return null
    }

    const data = {}

    // eslint-disable-next-line camelcase
    data.vote_response = _.pick(response, ['id', 'fixture_id', 'user_id', 'created_time', 'comment'])

    // eslint-disable-next-line camelcase
    data.vote_response_match = await conn('vote_response_match')
      .where('response_id', response.id)
      .select(['response_id', 'match_id', 'mascot_id'])

    return data
  }
}

exports.submitResponse = {
  auth(user, userId) {
    return user.id === userId
  },
  validateArgs(userId, fixtureId, submitData) {
    try {
      ow(userId, ow.number.positive.uint32)
      ow(fixtureId, ow.number.positive.uint32)
      ow(submitData, ow.object.exactShape({
        comment: ow.optional.any(ow.nullOrUndefined, ow.string.nonEmpty.maxLength(2000)),
        responses: ow.array.ofType(ow.object.exactShape({
          matchId: ow.number.positive.uint32,
          mascotId: ow.number.positive.uint32
        }))
      }))
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userId, fixtureId, submitData) {
    const [fixture] = await conn('vote_fixture')
      .where('id', fixtureId)

    if (!fixture || !getFixtureStatus(fixture)) {
      throw new err.IllegalOperationError('Invalid fixture')
    }

    const matchMascots = await conn('vote_match_mascot')
      .whereIn('match_id', function () {
        this.from('vote_match').where('fixture_id', fixtureId).select('id')
      })
      .select('match_id', 'mascot_id')

    const matchMascotMaps = _.mapValues(
      _.groupBy(matchMascots, 'match_id'),
      matchMascot => _.map(matchMascot, 'mascot_id')
    )

    if (submitData.responses.length !== Object.keys(matchMascotMaps).length) {
      throw new err.InvalidInputError('Invalid submit match data length')
    }

    for (const {matchId, mascotId} of submitData.responses) {
      const {[matchId]: map} = matchMascotMaps
      if (!map || !map.includes(mascotId)) {
        throw new err.InvalidInputError('Invalid submit match data values')
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
          throw new err.InvalidInputError('Response already exists')
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
