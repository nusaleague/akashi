exports.up = async knex => {
  await knex.schema.createTable('register', table => {
    table
      .bigIncrements('id')
      .unsigned()
      .notNullable()
      .primary();

    table
      .timestamp('created_time')
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp('updated_time')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    table
      .string('key', 16)
      .notNullable()
      .unique();

    table.text('data_json').notNullable();

    table
      .string('status', 16)
      .nullable()
      .defaultTo(null);
  });
};

exports.down = async knex => {
  await knex.schema.dropTable('register');
};
