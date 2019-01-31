const {connection: conn} = require('../lib/database/connection')
const {mustBeStaff} = require('../lib/rpc/auth')

const TBL_REG = 'reg'

exports.findAllRegs = {
  async fn() {
    const regs = await conn(TBL_REG).map(row => {
      const data = JSON.parse(row.data_json)

      return {
        id: row.id,
        createdTime: row.created_time,
        data: {
          mascotComp: data.mascotComp,
          mascotName: data.mascotName,
          orgName: data.orgName
        }
      }
    })
    return regs
  },
  auth: mustBeStaff('view_reg')
}

exports.findRegById = {
  async fn(id) {
    const [reg] = await conn(TBL_REG).where({id}).map(row => {
      const reg = {
        id: row.id,
        createdTime: row.created_time,
        logoImage: row.logo_file,
        mascotImage: row.mascot_file,
        data: JSON.parse(row.data_json)
      }

      return reg
    })
    return reg || null
  },
  auth: mustBeStaff('view_reg')
}
