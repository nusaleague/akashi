const _ = require('lodash');
const { default: ow } = require('ow');
const { serviceManager } = require('../lib/service');
const getFixtureStatus = require('./util/get-fixture-status');

module.exports = {
  name: 'getFixture',
  validateArgs(fixtureSlug) {
    ow(fixtureSlug, ow.string.nonEmpty);
  },
  async fn(fixtureSlug) {
    const conn = serviceManager.get('database');

    const [fixture] = await conn('vote_fixture').where('slug', fixtureSlug);

    if (!fixture) {
      return null;
    }

    const data = {};

    const status = getFixtureStatus(fixture);
    if (status === null) {
      return null;
    }

    data.status = status;

    // eslint-disable-next-line camelcase
    data.vote_fixture = _.pick(fixture, [
      'id',
      'slug',
      'comp',
      'season',
      'stage',
      'start_time',
      'end_time'
    ]);

    if (!status) {
      return data;
    }

    // eslint-disable-next-line camelcase
    data.vote_match = await conn('vote_match')
      .where('fixture_id', fixture.id)
      .select(['id', 'division']);

    // eslint-disable-next-line camelcase
    data.vote_match_mascot = await conn('vote_match_mascot')
      .whereIn('match_id', _.map(data.vote_match, 'id'))
      .select(['match_id', 'mascot_id']);

    data.mascot = await conn('mascot')
      .whereIn('id', _.map(data.vote_match_mascot, 'mascot_id'))
      .select([
        'id',
        'org_id',
        'slug',
        'short_name',
        'color_hex',
        'description'
      ]);

    data.org = await conn('org')
      .whereIn('id', _.uniq(_.map(data.mascot, 'org_id')))
      .select(['id', 'slug', 'short_name']);

    return data;
  }
};
