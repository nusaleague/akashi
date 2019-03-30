const path = require('path')
const {Router: router, json} = require('express')
const {sync: glob} = require('glob')
const createServer = require('../lib/rpc/server')
const {mapJSONRPCCode} = require('../lib/util')

const methods = createMethods(path.resolve('./rpc'))

const route = router()

route.post('/rpc',
  json(),
  (req, res, next) => {
    (async () => {
      const server = createServer(methods, req.user)

      const {body: request} = req
      const response = await server.dispatchRequest(request)

      req.app.log.debug({request, response}, 'JSON-RPC call completed')

      if (response === null) {
        res.sendStatus(204)
        return
      }

      if (Array.isArray(response)) {
        res.json(response)
        return
      }

      if (response.error) {
        const statusCode = mapJSONRPCCode(response.error.code)
        res.status(statusCode).json(response)
        return
      }

      res.json(response)
    })().catch(next)
  }
)

module.exports = route

function createMethods(dir) {
  return glob(path.resolve(dir, './*.js'))
    .map(methodsPath => require(methodsPath))
    .reduce((methods, newMethods) => {
      for (const methodName of Object.keys(newMethods)) {
        if (methods[methodName]) {
          throw new Error(`Duplicate method name: ${methodName}`)
        }
      }

      return Object.assign(methods, newMethods)
    }, {})
}
