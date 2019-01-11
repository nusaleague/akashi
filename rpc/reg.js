const conn = require('../lib/database')
const auth = require('../lib/auth')

async function findAllRegs() {
  const regs = await conn('reg')
    .select('id', 'created_time', 'data_json', 'status')
    .map(row => {
      const data = JSON.parse(row.data_json)

      return {
        id: row.id,
        created_time: row.created_time,
        competition: data.mascotComp,
        mascot_name: data.mascotName,
        org_name: data.orgName,
        status: row.status
      }
    })

  return regs
}
findAllRegs.auth = auth.isStaff()
exports.findAllRegs = findAllRegs

async function findRegById(id) {
  const [reg] = await conn('reg').where({id})

  return reg
}
findRegById.auth = auth.isStaff()
exports.findRegById = findRegById

async function setRegStatus(id, status, reason) {
  await conn('reg').where({id}).update({status, reason})

  return true
}
setRegStatus.auth = auth.isStaff()
exports.setRegStatus = setRegStatus
