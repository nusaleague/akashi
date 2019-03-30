const Server = require('@tkesgar/chihiro/lib/server')
const logger = require('../log')
const err = require('./error')

const log = logger.child({sub: 'jsonrpc'})

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
        validateArgs(...args)
      } catch (error) {
        throw new err.InvalidParamsError()
      }
    }

    if (auth !== true) {
      if (!user) {
        throw new err.AuthRequiredError()
      }

      const authorized = await auth(user, ...args)
      if (!authorized) {
        throw new err.UnauthorizedError()
      }
    }

    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      if (typeof error.message === 'string' && typeof error.code === 'number') {
        throw error
      }

      log.error({err: error}, 'Function call returned a non-standard error')
      throw new err.InternalMethodError()
    }
  })
}

module.exports = createServer
