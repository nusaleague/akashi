/* eslint-disable camelcase */
const Row = require('.');

const TABLE = 'user_social';

class UserSocialRow extends Row {
  static async findById(provider, id, conn) {
    return Row.find(
      TABLE,
      { provider, id },
      conn,
      data => new UserSocialRow(data, conn)
    );
  }

  static async findByUserId(provider, userId, conn) {
    return Row.find(
      TABLE,
      { provider, user_id: userId },
      conn,
      data => new UserSocialRow(data, conn)
    );
  }

  static async findAllByUserId(userId, conn) {
    return Row.findAll(
      TABLE,
      { user_id: userId },
      conn,
      data => new UserSocialRow(data, conn)
    );
  }

  static async insert(data = {}, conn = undefined) {
    const { provider, id, userId, verified = false, info = {} } = data;

    return Row.insert(
      TABLE,
      {
        provider,
        id,
        user_id: userId,
        verified,
        info_json: JSON.stringify(info)
      },
      conn,
      id => UserSocialRow.findById(provider, id, conn)
    );
  }

  constructor(data, conn) {
    super(TABLE, data, conn);
  }

  get provider() {
    return this.getColumn('provider');
  }

  get userId() {
    return this.getColumn('user_id');
  }

  get verified() {
    return this.getColumn('verified');
  }

  get info() {
    return JSON.parse(this.getColumn('info_json'));
  }

  async setProvider(provider) {
    await this.setData({ provider });
  }

  async setUserId(userId) {
    await this.setData({ user_id: userId });
  }

  async setVerified(verified) {
    return this.setData({ verified });
  }

  async setInfo(info) {
    await this.setData({ info_json: JSON.stringify(info) });
  }
}

module.exports = UserSocialRow;
