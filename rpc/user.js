const {default: ow} = require('ow')
const Haru = require('@tkesgar/haru')
const Futaba = require('@tkesgar/futaba')
const conn = require('../lib/database/connection')
const err = require('../lib/error')

// eslint-disable-next-line camelcase
exports.self_setUserName = {
  auth(user, userId) {
    return user.id === userId
  },
  validateArgs(userId, newName) {
    try {
      ow(userId, ow.number.positive.uint32)
      ow(newName, ow.string.matches(/^[a-z0-9_]{1, 16}$/))
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userId, newName) {
    try {
      await conn('user')
        .where('id', userId)
        .update({
          name: newName
        })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new DuplicateUserNameError()
      }

      throw error
    }
  }
}

// eslint-disable-next-line camelcase
exports.self_setUserDisplayName = {
  auth(user, userId) {
    return user.id === userId
  },
  validateArgs(userId, newDisplayName) {
    try {
      ow(userId, ow.number.positive.uint32)
      ow(newDisplayName, ow.string.nonEmpty.maxLength(24))
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userId, newDisplayName) {
    await conn('user')
      .where('id', userId)
      .update({
        /* eslint-disable camelcase */
        display_name: newDisplayName
        /* eslint-enable camelcase */
      })
  }
}

// eslint-disable-next-line camelcase
exports.self_setUserPassword = {
  auth(user, userId) {
    return user.id === userId
  },
  validateArgs(userId, newPassword) {
    try {
      ow(userId, ow.number.positive.uint32)
      ow(newPassword, ow.string.nonEmpty)
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userId, newPassword) {
    await conn('user')
      .where('id', userId)
      .update({
        /* eslint-disable camelcase */
        password_hash: (await Haru.create(newPassword)).toString()
        /* eslint-enable camelcase */
      })
  }
}

// eslint-disable-next-line camelcase
exports.self_setUserEmail = {
  auth(user, userId) {
    return user.id === userId
  },
  validateArgs(userId, newEmail) {
    try {
      ow(userId, ow.number.positive.uint32)
      ow(newEmail, ow.string.nonEmpty)
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userId, newEmail) {
    await conn('user')
      .where('id', userId)
      .update({
        /* eslint-disable camelcase */
        email_hash: Futaba.create(newEmail).toString(),
        email_verified: false
        /* eslint-enable camelcase */
      })
  }
}

exports.getUser = {
  auth(user) {
    return user.staff && user.staff.roles.includes('admin')
  },
  validateArgs(userId) {
    try {
      ow(userId, ow.number.positive.uint32)
    } catch (error) {
      return false
    }

    return true
  }
}

exports.insertUser = {
  auth(user) {
    return user.staff && user.staff.roles.includes('admin')
  },
  validateArgs(userData) {
    try {
      ow(userData, ow.object.exactShape({
        name: ow.string.matches(/^[a-z0-9_]{1, 16}$/),
        displayName: ow.optional.string.nonEmpty.maxLength(24),
        password: ow.optional.string.nonEmpty,
        email: ow.optional.string.nonEmpty,
        emailVerified: ow.optional.boolean
      }))
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userData) {
    const data = {
      name: userData.name
    }

    if (typeof userData.displayName !== 'undefined') {
      // eslint-disable-next-line camelcase
      data.display_name = userData.displayName
    }

    if (typeof userData.password !== 'undefined') {
      // eslint-disable-next-line camelcase
      data.password_hash = (await Haru.create(userData.password)).toString()
    }

    if (typeof userData.email !== 'undefined') {
      data.email = Futaba.create(userData.email).toString()
    }

    if (typeof userData.emailVerified !== 'undefined') {
      // eslint-disable-next-line camelcase
      data.email_verified = userData.emailVerified
    }

    try {
      const [id] = await conn('user').insert(data)
      return id
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new DuplicateUserNameError()
      }

      throw error
    }
  }
}

exports.deleteUser = {
  auth(user) {
    return user.staff && user.staff.roles.includes('admin')
  },
  validateArgs(userId) {
    try {
      ow(userId, ow.number.positive.uint32)
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userId) {
    try {
      await conn('user').where('id', userId).delete()
    } catch (error) {
      throw new err.IllegalOperationError()
    }
  }
}

exports.editUser = {
  auth(user) {
    return user.staff && user.staff.roles.includes('admin')
  },
  validateArgs(userId, userData) {
    try {
      ow(userId, ow.number.positive.uint32)
      ow(userData, ow.object.exactShape({
        name: ow.string.matches(/^[a-z0-9_]{1, 16}$/),
        displayName: ow.optional.string.nonEmpty.maxLength(24),
        password: ow.optional.string.nonEmpty,
        email: ow.optional.string.nonEmpty,
        emailVerified: ow.optional.boolean
      }))
    } catch (error) {
      return false
    }

    return true
  },
  async fn(userId, userData) {
    const data = {
      name: userData.name
    }

    if (typeof userData.displayName !== 'undefined') {
      // eslint-disable-next-line camelcase
      data.display_name = userData.displayName
    }

    if (typeof userData.password !== 'undefined') {
      // eslint-disable-next-line camelcase
      data.password_hash = (await Haru.create(userData.password)).toString()
    }

    if (typeof userData.email !== 'undefined') {
      data.email = Futaba.create(userData.email).toString()
    }

    if (typeof userData.emailVerified !== 'undefined') {
      // eslint-disable-next-line camelcase
      data.email_verified = userData.emailVerified
    }

    try {
      await conn('user').where('id', userId).update(data)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new DuplicateUserNameError()
      }

      throw error
    }
  }
}

class DuplicateUserNameError extends err.DuplicateDataError {
  constructor() {
    super('User name already exists')
  }
}
