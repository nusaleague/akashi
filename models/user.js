const Haru = require('@tkesgar/haru');
const {serviceManager} = require('../lib/service');

module.exports = {
  name: 'user',
  init() {
    const db = serviceManager.get('database');
    const log = serviceManager.get('log');

    return class User {
      static async findById(id) {
        const [row] = await db('user').where('id', id);

        return row ? new User(row.id, {row}) : null;
      }

      static async findByName(name) {
        const [row] = await db('user')
          .whereNotNull('name')
          .andWhere('name', name);

        return row ? new User(row.id, {row}) : null;
      }

      static async authenticateWithSocial(provider, socialId, socialInfo) {
        const [socialRow] = await db('user_social')
          .where('provider', provider).andWhere('id', socialId)
          .select('user_id');

        if (socialRow) {
          const {user_id: userId} = socialRow;

          try {
            await db('user_social')
              .where('provider', provider).andWhere('id', socialId)
              .update({
                // eslint-disable-next-line camelcase
                info_json: JSON.stringify(socialInfo)
              });
          } catch {
            log.warn({provider, socialId, userId}, 'Failed to update social info');
          }

          return new User(userId);
        }

        const userId = await db.transaction(async trx => {
          const [id] = await trx('user').insert({
            // eslint-disable-next-line camelcase
            display_name: socialInfo.name
          });

          await trx('user_social').insert({
            /* eslint-disable camelcase */
            provider,
            id: socialId,
            user_id: id,
            info_json: JSON.stringify(socialInfo)
            /* eslint-enable camelcase */
          });

          return id;
        });
        return new User(userId);
      }

      constructor(id, opts = {}) {
        const {
          row = null
        } = opts;

        this.id = id;
        this._cachedRow = row;
      }

      async getRow() {
        if (!this._cachedRow) {
          this._cachedRow = await db('user').where('id', this.id);
        }

        return this._cachedRow;
      }

      async isStaff() {
        const row = await this.getRow();
        return row.name && row.name.startsWith('#');
      }

      async testPassword(password) {
        const row = await this.getRow();
        return Haru.test(row.password_hash, password);
      }

      async getPassportData() {
        const data = {};

        const row = await this.getRow();
        Object.assign(data, {
          id: row.id,
          name: row.name,
          displayName: row.display_name,
          emailHash: row.email_hash,
          emailVerified: Boolean(row.email_verified)
        });

        // TODO Implementasi tabel staff.
        data.staff = await this.isStaff();

        return data;
      }
    };
  }
};
