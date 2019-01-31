function mustBeUser() {
  return () => true
}
exports.mustBeUser = mustBeUser

function mustBeSelf(userIdFn = (...args) => args[0]) {
  return (user, ...args) => user.id === userIdFn(...args)
}
exports.mustBeSelf = mustBeSelf

function mustBeStaff(role) {
  if (!role) {
    return user => Boolean(user.staff)
  }

  return user => user.staff && user.staff.roles.includes(role)
}
exports.mustBeStaff = mustBeStaff
