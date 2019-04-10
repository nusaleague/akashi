const path = require('path')
const {Router: router, json} = require('express')
const {sync: glob} = require('glob')
const Server = require('@tkesgar/chihiro/lib/server')
const err = require('../lib/error')
const logger = require('../lib/log')

const log = logger.child({sub: 'jsonrpc'})

const methods = glob(path.resolve('./rpc/*.js'))
  .map(methodsPath => require(methodsPath))
  .reduce((methods, newMethods) => {
    for (const methodName of Object.keys(newMethods)) {
      if (methods[methodName]) {
        throw new Error(`Duplicate method: ${methodName}`)
      }
    }

    return Object.assign(methods, newMethods)
  }, {})

const route = router()

route.post('/rpc',
  json(),
  (req, res, next) => {
    (async () => {
      const {body: request, user} = req

      const server = createServer(methods, user)
      const response = await server.dispatchRequest(request)

      if (response === null) {
        res.sendStatus(204)
        return
      }

      res.json(response)
    })().catch(next)
  }
)

module.exports = route

function createServer(methods, user) {
  return new Server(async (method, params) => {
    const methodInfo = methods[method]
    if (!methodInfo) {
      throw new err.MethodNotFoundError()
    }

    const {mapParams, validateArgs, auth, fn} = methodInfo

    const args = (() => {
      if (typeof params === 'undefined') {
        return []
      }

      if (Array.isArray(params)) {
        return params
      }

      if (!mapParams) {
        throw new err.InvalidParamsError()
      }

      return mapParams(params)
    })()

    if (validateArgs) {
      try {
        await validateArgs(...args)
      } catch {
        throw new err.InvalidParamsError()
      }
    }

    if (auth) {
      if (auth !== true) {
        if (!user) {
          throw new err.AuthRequiredError()
        }

        if (!(await auth(user, ...args))) {
          throw new err.UnauthorizedError()
        }
      }
    } else {
      log.error({method}, '\'auth\' property required')
      throw new Error('\'auth\' property required')
    }

    let result
    try {
      result = await fn(...args)
    } catch (error) {
      const {message, code} = error
      if (typeof message === 'string' && typeof code === 'number') {
        throw error
      }

      log.error({err: error}, 'Function call returned a non-standard error')
      throw new err.InternalMethodError()
    }

    return result
  })
}
