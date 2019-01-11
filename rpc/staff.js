const conn = require('../lib/database')
const auth = require('../lib/auth')

async function insertStaff(userId, roles) {
  await conn('staff').insert({
    user_id: userId,
    roles: roles.join(',')
  })
}
insertStaff.auth = auth.isAdmin()
exports.insertUserAsStaff = insertStaff

async function deleteStaff(userId) {
  await conn('staff').where({id: userId}).del()
}
deleteStaff.auth = auth.isAdmin()
exports.deleteStaff = deleteStaff

async function findAllStaffs() {
  const staffs = await conn('staff')
    .join('user', 'user_id', 'user.id')
    .select('id', 'created_time', 'name', 'roles')
    .map(row => ({
      id: row.id,
      created_time: row.created_time,
      name: row.name,
      roles: row.roles.split(',')
    }))

  return staffs
}
findAllStaffs.auth = auth.isAdmin()
exports.findAllStaffs = findAllStaffs

async function findStaffByUserId(userId) {
  const [staff] = await conn('staff')
    .join('user', 'user_id', 'user.id')
    .where({user_id: userId})
    .select('id', 'created_time', 'name', 'roles')
    .map(row => ({
      id: row.id,
      created_time: row.created_time,
      name: row.name,
      roles: row.roles.split(',')
    }))

  return staff
}
findStaffByUserId.auth = auth.isAdmin()
exports.findStaffByUserId = findStaffByUserId

async function setStaffRoles(userId, roles) {
  await conn('staff').where({user_id: userId}).update({roles: roles.join(',')})
}
setStaffRoles.auth = auth.isAdmin()
exports.setStaffRoles = setStaffRoles
