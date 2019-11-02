exports.up = async knex => {
  await knex.schema.createTable('mascot', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table.bigInteger('org_id')
      .unsigned()
      .notNullable();

    table.string('slug', 16)
      .notNullable()
      .unique();

    table.string('name', 64)
      .notNullable();

    table.string('short_name', 24)
      .notNullable();

    table.string('comp', 16)
      .notNullable();

    table.string('color_hex', 7)
      .notNullable()
      .defaultTo('#000000');

    table.string('description', 200)
      .nullable()
      .defaultTo(null);
  });

  await knex.schema.createTable('mascot_season', table => {
    table.bigInteger('mascot_id')
      .unsigned()
      .notNullable();

    table.bigInteger('season_id')
      .unsigned()
      .notNullable();

    table.string('division', 16)
      .notNullable();

    table.primary(['mascot_id', 'season_id', 'division']);
  });

  await knex.schema.createTable('match', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table.bigInteger('season_id')
      .unsigned()
      .notNullable();

    table.string('stage', 4)
      .notNullable();
  });

  await knex.schema.createTable('match_mascot', table => {
    table.bigInteger('match_id')
      .unsigned()
      .notNullable();

    table.bigInteger('mascot_id')
      .unsigned()
      .notNullable();

    table.integer('half_vote')
      .unsigned()
      .nullable()
      .defaultTo(null);

    table.integer('half_score')
      .unsigned()
      .nullable()
      .defaultTo(null);

    table.integer('full_vote')
      .unsigned()
      .nullable()
      .defaultTo(null);

    table.integer('full_score')
      .unsigned()
      .nullable()
      .defaultTo(null);

    table.primary(['match_id', 'mascot_id']);
  });

  await knex.schema.createTable('org', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table.string('slug', 16)
      .notNullable()
      .unique();

    table.string('name', 64)
      .notNullable();

    table.string('short_name', 24)
      .notNullable();

    table.string('category', 16)
      .nullable()
      .defaultTo(null);
  });

  await knex.schema.createTable('season', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table.string('comp', 16)
      .notNullable();

    table.string('year', 8)
      .notNullable();

    table.unique(['comp', 'year']);
  });

  await knex.schema.createTable('user', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table.string('name', 16)
      .nullable()
      .defaultTo(null)
      .unique();

    table.string('display_name', 24)
      .notNullable();

    table.timestamp('created_time')
      .notNullable()
      .defaultTo(knex.fn.now());

    table.timestamp('updated_time')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    table.string('password_hash', 256)
      .nullable()
      .defaultTo(null);

    table.string('email_hash', 128)
      .nullable()
      .defaultTo(null);

    table.boolean('email_verified')
      .notNullable()
      .defaultTo(false);
  });

  await knex.schema.createTable('user_social', table => {
    table.string('provider', 8)
      .notNullable();

    table.string('id', 64)
      .notNullable();

    table.bigInteger('user_id')
      .unsigned()
      .notNullable();

    table.timestamp('created_time')
      .notNullable()
      .defaultTo(knex.fn.now());

    table.timestamp('updated_time')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    table.boolean('verified')
      .notNullable()
      .defaultTo(false);

    table.text('info_json')
      .nullable()
      .defaultTo(null);

    table.primary(['provider', 'id']);

    table.unique(['user_id', 'provider']);
  });

  await knex.schema.createTable('vote_fixture', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table.string('slug', 32)
      .notNullable()
      .unique();

    table.string('comp', 16)
      .notNullable();

    table.string('season', 8)
      .notNullable();

    table.string('stage', 4)
      .notNullable();

    table.timestamp('start_time')
      .nullable()
      .defaultTo(null);

    table.timestamp('end_time')
      .nullable()
      .defaultTo(null);

    table.boolean('override_open')
      .notNullable()
      .defaultTo(false);
  });

  await knex.schema.createTable('vote_match', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table.bigInteger('fixture_id')
      .unsigned()
      .notNullable();

    table.string('division', 16)
      .nullable()
      .defaultTo(null);
  });

  await knex.schema.createTable('vote_match_mascot', table => {
    table.bigInteger('match_id')
      .unsigned()
      .notNullable();

    table.bigInteger('mascot_id')
      .unsigned()
      .notNullable();

    table.primary(['match_id', 'mascot_id']);
  });

  await knex.schema.createTable('vote_response', table => {
    table.bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table.bigInteger('fixture_id')
      .unsigned()
      .notNullable();

    table.bigInteger('user_id')
      .unsigned()
      .notNullable();

    table.timestamp('created_time')
      .notNullable()
      .defaultTo(knex.fn.now());

    table.string('comment', 2000)
      .nullable()
      .defaultTo(null);

    table.boolean('ignore')
      .notNullable()
      .defaultTo(false);

    table.unique(['fixture_id', 'user_id']);
  });

  await knex.schema.createTable('vote_response_match', table => {
    table.bigInteger('response_id')
      .unsigned()
      .notNullable();

    table.bigInteger('match_id')
      .unsigned()
      .notNullable();

    table.bigInteger('mascot_id')
      .unsigned()
      .notNullable();

    table.unique(['response_id', 'match_id']);
  });

  await knex.schema.createTable('_enum_comp', table => {
    table.string('value', 16)
      .notNullable()
      .primary();
  });

  await knex.schema.createTable('_enum_org_category', table => {
    table.string('value', 16)
      .notNullable()
      .primary();
  });

  await knex.schema.table('mascot', table => {
    table.foreign('comp')
      .references('_enum_comp.value')
      .onUpdate('cascade')
      .onDelete('restrict');

    table.foreign('org_id')
      .references('org.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex.schema.table('mascot_season', table => {
    table.foreign('mascot_id')
      .references('mascot.id')
      .onUpdate('restrict')
      .onDelete('cascade');

    table.foreign('season_id')
      .references('season.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex.schema.table('match', table => {
    table.foreign('season_id')
      .references('season.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex.schema.table('match_mascot', table => {
    table.foreign('match_id')
      .references('match.id')
      .onUpdate('restrict')
      .onDelete('cascade');

    table.foreign('mascot_id')
      .references('mascot.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex.schema.table('org', table => {
    table.foreign('category')
      .references('_enum_org_category.value')
      .onUpdate('cascade')
      .onDelete('restrict');
  });

  await knex.schema.table('season', table => {
    table.foreign('comp')
      .references('_enum_comp.value')
      .onUpdate('cascade')
      .onDelete('restrict');
  });

  await knex.schema.table('user_social', table => {
    table.foreign('user_id')
      .references('user.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex.schema.table('vote_fixture', table => {
    table.foreign('comp')
      .references('_enum_comp.value')
      .onUpdate('cascade')
      .onDelete('restrict');
  });

  await knex.schema.table('vote_match', table => {
    table.foreign('fixture_id')
      .references('vote_fixture.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex.schema.table('vote_match_mascot', table => {
    table.foreign('match_id')
      .references('vote_match.id')
      .onUpdate('restrict')
      .onDelete('cascade');

    table.foreign('mascot_id')
      .references('mascot.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex.schema.table('vote_response', table => {
    table.foreign('fixture_id')
      .references('vote_fixture.id')
      .onUpdate('restrict')
      .onDelete('cascade');

    table.foreign('user_id')
      .references('user.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex.schema.table('vote_response_match', table => {
    table.foreign('response_id')
      .references('vote_response.id')
      .onUpdate('restrict')
      .onDelete('cascade');

    table.foreign('match_id')
      .references('vote_match.id')
      .onUpdate('restrict')
      .onDelete('cascade');

    table.foreign('mascot_id')
      .references('mascot.id')
      .onUpdate('restrict')
      .onDelete('cascade');
  });

  await knex('_enum_comp').insert([
    {value: 'nusaimoe'},
    {value: 'nusaikemen'}
  ]);

  await knex('_enum_org_category').insert([
    {value: 'circle'},
    {value: 'commercial'},
    {value: 'community'},
    {value: 'community_acdm'},
    {value: 'media'}
  ]);
};

exports.down = async knex => {
  await knex.schema.table('mascot', table => {
    table.dropForeign('comp');
    table.dropForeign('org_id');
  });

  await knex.schema.table('mascot_season', table => {
    table.dropForeign('mascot_id');
    table.dropForeign('season_id');
  });

  await knex.schema.table('match', table => {
    table.dropForeign('season_id');
  });

  await knex.schema.table('match_mascot', table => {
    table.dropForeign('match_id');
    table.dropForeign('mascot_id');
  });

  await knex.schema.table('org', table => {
    table.dropForeign('category');
  });

  await knex.schema.table('season', table => {
    table.dropForeign('comp');
  });

  await knex.schema.table('user_social', table => {
    table.dropForeign('user_id');
  });

  await knex.schema.table('vote_fixture', table => {
    table.dropForeign('comp');
  });

  await knex.schema.table('vote_match', table => {
    table.dropForeign('fixture_id');
  });

  await knex.schema.table('vote_match_mascot', table => {
    table.dropForeign('match_id');
    table.dropForeign('mascot_id');
  });

  await knex.schema.table('vote_response', table => {
    table.dropForeign('fixture_id');
    table.dropForeign('user_id');
  });

  await knex.schema.table('vote_response_match', table => {
    table.dropForeign('response_id');
    table.dropForeign('match_id');
    table.dropForeign('mascot_id');
  });

  await knex.schema.dropTable('mascot');
  await knex.schema.dropTable('mascot_season');
  await knex.schema.dropTable('match');
  await knex.schema.dropTable('match_mascot');
  await knex.schema.dropTable('org');
  await knex.schema.dropTable('season');
  await knex.schema.dropTable('user');
  await knex.schema.dropTable('user_social');
  await knex.schema.dropTable('vote_fixture');
  await knex.schema.dropTable('vote_match');
  await knex.schema.dropTable('vote_match_mascot');
  await knex.schema.dropTable('vote_response');
  await knex.schema.dropTable('vote_response_match');
  await knex.schema.dropTable('_enum_comp');
  await knex.schema.dropTable('_enum_org_category');
};
