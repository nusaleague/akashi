const Haru = require('@tkesgar/haru')
const conn = require('../lib/database')
const auth = require('../lib/auth')

async function insertUser(name, password) {
  const passwordHash = password ? (await Haru.fromPassword(password)).toString() : null

  await conn('user').insert({name, password_hash: passwordHash})
}
insertUser.auth = auth.isAdmin()
exports.insertUser = insertUser

async function deleteUser(id) {
  await conn('user').where({id}).del()
}
deleteUser.auth = auth.isAdmin()
exports.deleteUser = deleteUser

async function findUserById(id) {
  const [user] = await conn('user').where({id}).select('id', 'created_time', 'name')

  return user
}
findUserById.auth = auth.isAdmin()
exports.findUserById = findUserById

async function findUserByName(name) {
  const [user] = await conn('user').where({name}).select('id', 'created_time', 'name')

  return user
}
findUserByName.auth = auth.isAdmin()
exports.findUserByName = findUserByName

async function setUserName(id, name) {
  await conn('user').where({id}).update({name})
}
setUserName.auth = auth.isAdmin()
exports.setUserName = setUserName

async function setUserPassword(id, password) {
  if (!password) {
    throw new Error('Cannot unset existing password')
  }

  const passwordHash = (await Haru.fromPassword(password)).toString()

  await conn('user').where({id}).update({password_hash: passwordHash})
}
setUserPassword.auth = auth.isAdmin()
exports.setUserPassword = setUserPassword

async function ctx_changeUserPassword(oldPassword, newPassword) {
  const userId = this.ctx.user.id

  const [user] = await conn('user').where({id: userId})

  const match = await Haru.fromJSON(user.password_hash).test(oldPassword)
  if (!match) {
    throw new Error('Old password does not match')
  }

  const newPasswordHash = (await Haru.fromPassword(newPassword)).toString()

  await conn('user').where({id: userId}).update({password_hash: newPasswordHash})
}
ctx_changeUserPassword.auth = auth.isUser()
exports.ctx_changeUserPassword = ctx_changeUserPassword
