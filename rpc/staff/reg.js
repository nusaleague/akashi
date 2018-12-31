const conn = require('../../lib/database')

module.exports = {
  async getAllRegData() {
    return conn('reg').map(row => {
      return {
        id: row.id,
        createdTime: row.created_time,
        updatedTime: row.updated_time,
        data: JSON.parse(row.data_json),
        logoImage: row.logo_file,
        mascotImage: row.mascot_file,
        status: Boolean(row.status),
        ...(row.status ? {reason: row.reason} : {})
      }
    })
  }
}
