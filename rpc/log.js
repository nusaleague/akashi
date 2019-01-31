const {connection: conn} = require('../lib/database/connection')
const auth = require('../lib/rpc/auth')

const TBL_LOG = 'log'
const LOG_INFO_COLS = ['id', 'created_time', 'user_id', 'message']

exports.insertLog = {
  async fn(userId, message, data) {
    const dataJSON = data ? JSON.stringify(data) : null

    await conn(TBL_LOG).insert({
      message,
      user_id: userId,
      data_json: dataJSON
    })
  },
  auth: auth.mustBeSelf()
}

exports.findAllLogsByTime = {
  async fn(startTime, endTime) {
    const logs = await conn(TBL_LOG)
      .whereBetween('created_time', [startTime, endTime])
      .select(LOG_INFO_COLS)
      .map(mapLogInfo)

    return logs
  },
  auth: auth.mustBeStaff('view_log')
}

exports.findAllLogsByUserId = {
  async fn(userId) {
    const logs = await conn(TBL_LOG)
      .where({user_id: userId})
      .select(LOG_INFO_COLS)
      .map(mapLogInfo)

    return logs
  },
  auth: auth.mustBeStaff('view_log')
}

exports.findAllLogsByMessage = {
  async fn(message) {
    const logs = await conn(TBL_LOG)
      .where('message', 'like', message)
      .select(LOG_INFO_COLS)
      .map(mapLogInfo)

    return logs
  },
  auth: auth.mustBeStaff('view_log')
}

exports.findLogById = {
  async fn(id) {
    const [row] = await conn(TBL_LOG)
      .where({id})
      .map(row => ({
        ...mapLogInfo(row),
        data: JSON.parse(row.data_json)
      }))

    return row || null
  },
  auth: auth.mustBeStaff('view_log')
}

function mapLogInfo(row) {
  return {
    id: row.id,
    createdTime: row.created_time,
    userId: row.user_id,
    message: row.message
  }
}
