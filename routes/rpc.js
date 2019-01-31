const path = require('path')
const {sync: glob} = require('glob')
const {Router: router, json} = require('express')
const createServer = require('../lib/rpc/server')

const methods = glob(path.resolve('./rpc/*.js'))
  .map(path => require(path))
  .reduce((methods, method) => Object.assign(methods, method), {})

const route = router()

route.post('/rpc',
  json(),
  (req, res, next) => {
    (async () => {
      const user = req.user || null
      const server = createServer(methods, user)

      const request = req.body
      const response = await server.dispatchRequest(request)
      req.app.log.debug({user, request, response}, 'JSON-RPC dispatch successful')

      if (response === null) {
        res.sendStatus(204)
        return
      }

      if (Array.isArray(response)) {
        res.json(response)
        return
      }

      if (response.error) {
        res.status(httpStatus(response.error.code)).json(response)
        return
      }

      res.json(response)
    })().catch(next)
  }
)

module.exports = route

function httpStatus(code) {
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
