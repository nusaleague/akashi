/* eslint-disable camelcase */
const Haru = require('@tkesgar/haru');
const Row = require('.');

const TABLE = 'user';

class UserRow extends Row {
  static async findById(id, conn) {
    return Row.find(TABLE, { id }, conn, data => new UserRow(data, conn));
  }

  static async findByName(name, conn) {
    return Row.find(TABLE, { name }, conn, data => new UserRow(data, conn));
  }

  static async insert(data = {}, conn = undefined) {
    const {
      name = null,
      displayName = null,
      password = null,
      email = null,
      emailVerified = false
    } = data;

    return Row.insert(
      TABLE,
      {
        name,
        display_name: displayName,
        password_hash: password
          ? (await Haru.create(password)).toString()
          : null,
        email_hash: email ? (await Haru.create(email)).toString() : null,
        email_verified: emailVerified
      },
      conn,
      id => UserRow.findById(id, conn)
    );
  }

  constructor(data, conn) {
    super(TABLE, data, conn);
  }

  get name() {
    return this.getColumn('name');
  }

  get displayName() {
    return this.getColumn('display_name') || this.name;
  }

  get passwordHash() {
    const hash = this.getColumn('password_hash');
    return Haru.from(hash);
  }

  get emailHash() {
    const hash = this.getColumn('email_hash');
    return Haru.from(hash);
  }

  get emailVerified() {
    return Boolean(this.getColumn('email_verified'));
  }

  async setName(name) {
    await this.setData({ name });
  }

  async setDisplayName(displayName) {
    await this.setData({ display_name: displayName });
  }

  async setPassword(password) {
    const passwordHash = await Haru.create(password);
    await this.setData({ password_hash: passwordHash.toString() });
  }

  async setEmail(email, emailVerified = false) {
    const emailHash = await Haru.create(email);
    await this.setData({
      email_hash: emailHash.toString(),
      email_verified: emailVerified
    });
  }
}

module.exports = UserRow;
