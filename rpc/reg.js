const conn = require('../lib/database/connection')

exports.getAllRegs = {
  async fn() {
    const regs = await conn('reg').map(row => {
      const data = JSON.parse(row.data_json)

      return {
        id: row.id,
        createdTime: row.created_time,
        status: row.status === null ? null : Boolean(row.status),
        data: {
          mascotComp: data.mascotComp,
          mascotName: data.mascotName,
          orgName: data.orgName
        }
      }
    })
    return regs
  },
  auth(user) {
    return Boolean(user.staff)
  }
}

exports.getReg = {
  async fn(id) {
    const [reg] = await conn('reg').where({id}).map(row => {
      const reg = {
        id: row.id,
        createdTime: row.created_time,
        logoImage: row.logo_file,
        mascotImage: row.mascot_file,
        data: JSON.parse(row.data_json)
      }

      Object.assign(reg, row.status === null ? {
        status: null
      } : {
        status: Boolean(row.status),
        reason: row.reason
      })

      return reg
    })
    return reg || null
  },
  auth(user) {
    return Boolean(user.staff)
  }
}

exports.setRegStatus = {
  async fn(id, status, reason = null) {
    await conn('reg').where({id}).update({status, reason})
  },
  auth(user) {
    return Boolean(user.staff)
  }
}
