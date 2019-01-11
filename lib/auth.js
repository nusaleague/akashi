function isUser() {
  return user => Boolean(user)
}
exports.isUser = isUser

function isStaff() {
  return user => user && user.staff
}
exports.isStaff = isStaff

function isStaffRole(...roles) {
  return user => {
    if (!user || !user.staff) {
      return false
    }

    for (const role of roles) {
      if (!user.staff.roles.includes(role)) {
        return false
      }
    }
    return true
  }
}
exports.isStaffRole = isStaffRole

function isAdmin() {
  return isStaffRole('su')
}
exports.isAdmin = isAdmin
