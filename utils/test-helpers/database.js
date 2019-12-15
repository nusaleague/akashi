const knex = require('knex');

function createKnex() {
  return knex({ client: 'mysql' });
}

exports.createKnex = createKnex;

function createKnexPromise(value) {
  return Object.assign(Promise.resolve(value), knex({ client: 'mysql' }));
}

exports.createKnexPromise = createKnexPromise;
