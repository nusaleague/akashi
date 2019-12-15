const UserRow = require('../utils/database/row/user');
const UserSocialRow = require('../utils/database/row/user-social');

class UserModel {
  static async findById(id) {
    const userRow = await UserRow.findById(id);
    return userRow ? new UserModel(userRow) : null;
  }

  static async findByPassword(name, password) {
    const userRow = await UserRow.findByName(name);
    if (!userRow) {
      return null;
    }

    const passwordMatch = await userRow.passwordHash.test(password);
    if (!passwordMatch) {
      return null;
    }

    return new UserModel(userRow);
  }

  static async findBySocial(provider, id) {
    const userSocialRow = await UserSocialRow.findById(provider, id);
    if (!userSocialRow) {
      return null;
    }

    const user = await UserModel.findById(userSocialRow.userId);
    user.userSocialRows[provider] = userSocialRow;

    return user;
  }

  static async create(userData, conn) {
    const userRow = await UserRow.insert(userData, conn);
    return new UserModel(userRow);
  }

  constructor(userRow) {
    this.userRow = userRow;
    this.userSocialRows = {};
  }

  get id() {
    return this.userRow.id;
  }

  get name() {
    return this.userRow.name;
  }

  get displayName() {
    return this.userRow.displayName;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName
    };
  }

  async addSocial(provider, id, info) {
    const userSocialRow = await UserSocialRow.insert(
      {
        provider,
        id,
        userId: this.id,
        info
      },
      this.userRow.connection
    );
    this.userSocialRows[provider] = userSocialRow;
  }

  async updateSocialInfo(provider, info) {
    if (!this.userSocialRows[provider]) {
      const userSocialRow = await UserSocialRow.findByUserId(provider, this.id);

      if (!userSocialRow) {
        throw new Error(
          `User ${this.id} does not have social row for ${provider}`
        );
      }

      this.userSocialRows[provider] = userSocialRow;
    }

    await this.userSocialRows[provider].setInfo(info);
  }
}

module.exports = UserModel;
