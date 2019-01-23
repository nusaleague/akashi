const {Router: router, json} = require('express')
const createServer = require('../lib/rpc')
const logger = require('../lib/log')

const route = router()

route.post('/rpc',
  json(),
  (req, res, next) => {
    (async () => {
      const user = req.user || null

      const server = createServer(user)

      const request = req.body
      const response = await server.dispatchRequest(request)
      logger.debug({user, request, response}, 'JSON-RPC call')

      if (response === null) {
        res.sendStatus(204)
        return
      }

      if (response.result || Array.isArray(response)) {
        res.json(response)
        return
      }

      if (response.error) {
        res.status(getStatusCode(response.error.code)).json(response)
        return
      }

      res.sendStatus(500)
    })().catch(next)
  }
)

module.exports = route

function getStatusCode(code) {
  switch (code) {
    case -32700: return 400
    case -32600: return 400
    case -32601: return 404
    case -32602: return 400
    case -32603: return 500
    case -32001: return 401
    case -32003: return 403
    default: return 500
  }
}
