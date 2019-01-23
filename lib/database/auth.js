const Haru = require('@tkesgar/haru')
const conn = require('./connection')

async function authByPassword(username, password) {
  const [user] = await conn('user')
    .where({name: username})
    .select('id', 'password_hash')

  if (!user) {
    return null
  }

  if (user.password_hash === null) {
    return null
  }

  const match = await Haru.fromJSON(user.password_hash).test(password)
  if (!match) {
    return null
  }

  return {id: user.id}
}
exports.authByPassword = authByPassword

async function getUserData(id) {
  const user = {}

  const [userRow] = await conn('user').where({id}).select('id', 'name')
  if (!userRow) {
    throw new Error('Invalid user id provided for deserialization')
  }
  Object.assign(user, {
    id: userRow.id,
    name: userRow.name
  })

  const [staffRow] = await conn('staff').where({user_id: id})
  if (staffRow) {
    Object.assign(user, {
      staff: {
        roles: staffRow.roles.split(',')
      }
    })
  }

  return user
}
exports.getUserData = getUserData
