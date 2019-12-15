const UserModel = require('../models/user');
const { UnauthorizedError } = require('../utils/error');
const log = require('../utils/log');
const database = require('../utils/database');

exports.authByPassword = async (name, password) => {
  const user = await UserModel.findByPassword(name, password);
  if (!user) {
    throw new UnauthorizedError('Invalid name or password');
  }

  return user;
};

exports.authBySocial = async (provider, id, info) => {
  const user = await UserModel.findBySocial(provider, id);
  if (user) {
    try {
      await user.updateSocialInfo(provider, info);
    } catch (error) {
      log.warn(
        { err: error, provider, id, info, userId: user.id },
        'Failed to update social info'
      );
    }

    return user;
  }

  return database.transaction(async trx => {
    const newUserData = {};

    if (typeof info.name === 'string') {
      newUserData.displayName = info.name;
    }

    const user = await UserModel.create(newUserData, trx);
    await user.addSocial(provider, id, info);

    return user;
  });
};
