exports.up = async knex => {
  await knex.schema.alterTable('user', table => {
    table
      .string('email_hash', 256)
      .nullable()
      .defaultTo(null)
      .alter();
  });
};

exports.down = async knex => {
  await knex.schema.alterTable('user', table => {
    table
      .string('email_hash', 128)
      .nullable()
      .defaultTo(null)
      .alter();
  });
};
