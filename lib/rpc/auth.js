function asUser() {
  return user => Boolean(user)
}

exports.asUser = asUser

function asSelf() {
  return (user, userId) => user.id === userId
}

exports.asSelf = asSelf

function asStaff(role) {
  if (!role) {
    return user => Boolean(user.staff)
  }

  return user => user.staff && user.staff.roles.includes(role)
}

exports.asStaff = asStaff
