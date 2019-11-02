const _ = require('lodash');
const {default: ow} = require('ow');
const err = require('../lib/error');
const {serviceManager} = require('../lib/service');
const getFixtureStatus = require('./util/get-fixture-status');

module.exports = {
  name: 'submitResponse',
  auth(user, userId) {
    return user.id === userId;
  },
  validateArgs(userId, fixtureId, submitData) {
    ow(userId, ow.number.positive.uint32);
    ow(fixtureId, ow.number.positive.uint32);
    ow(submitData, ow.object.exactShape({
      comment: ow.optional.any(ow.nullOrUndefined, ow.string.nonEmpty.maxLength(2000)),
      responses: ow.array.ofType(ow.object.exactShape({
        matchId: ow.number.positive.uint32,
        mascotId: ow.number.positive.uint32
      }))
    }));
  },
  async fn(userId, fixtureId, submitData) {
    const conn = serviceManager.get('database');

    const [fixture] = await conn('vote_fixture')
      .where('id', fixtureId);

    if (!fixture || !getFixtureStatus(fixture)) {
      throw new err.IllegalOperationError('Invalid fixture');
    }

    const matchMascots = await conn('vote_match_mascot')
      .whereIn('match_id', function () {
        this.from('vote_match').where('fixture_id', fixtureId).select('id');
      })
      .select('match_id', 'mascot_id');

    const matchMascotMaps = _.mapValues(
      _.groupBy(matchMascots, 'match_id'),
      matchMascot => _.map(matchMascot, 'mascot_id')
    );

    if (submitData.responses.length !== Object.keys(matchMascotMaps).length) {
      throw new err.InvalidInputError('Invalid submit match data length');
    }

    for (const {matchId, mascotId} of submitData.responses) {
      const {[matchId]: map} = matchMascotMaps;
      if (!map || !map.includes(mascotId)) {
        throw new err.InvalidInputError('Invalid submit match data values');
      }
    }

    await conn.transaction(async trx => {
      let result;
      try {
        result = await trx('vote_response').insert({
          /* eslint-disable camelcase */
          fixture_id: fixtureId,
          user_id: userId,
          comment: submitData.comment || null
          /* eslint-enable camelcase */
        });
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new err.InvalidInputError('Response already exists');
        }

        throw error;
      }

      const [responseId] = result;

      await trx('vote_response_match').insert(
        submitData.responses.map(response => ({
          /* eslint-disable camelcase */
          response_id: responseId,
          match_id: response.matchId,
          mascot_id: response.mascotId
          /* eslint-enable camelcase */
        }))
      );
    });
  }
};
