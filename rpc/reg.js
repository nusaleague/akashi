const conn = require('../lib/database')

async function getRegs() {
  const results = await conn('reg')
  return results
}
exports.getRegs = getRegs

async function getRegById(id) {
  const [result] = await conn('reg').where('id', id)
  return result || null
}
exports.getRegById = getRegById

async function setRegStatus(id, status, reason) {
  await conn('reg').where('id', id).update({status, reason})
  return getRegById(id)
}
exports.setRegStatus = setRegStatus
