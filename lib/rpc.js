const path = require('path')
const Server = require('@tkesgar/chihiro/lib/server')
const {sync: glob} = require('glob')
const logger = require('./log')

const METHOD_NOT_FOUND = -32601
const INVALID_PARAMS = -32602
const INTERNAL_ERROR = -32603
const AUTH_REQUIRED = -32001
const AUTH_INVALID = -32003

const methods = Object.assign({}, ...glob(path.resolve('./rpc/*.js')).map(path => require(path)))

class JSONRPCError extends Error {
  constructor(message, code, data) {
    super(message)

    this.code = code

    if (typeof data !== 'undefined') {
      this.data = data
    }
  }
}

function createServer(user) {
  return new Server(async (method, args) => {
    if (typeof args === 'undefined') {
      args = []
    }

    if (!Array.isArray(args)) {
      throw new JSONRPCError('Invalid params', INVALID_PARAMS)
    }

    const methodData = methods[method]
    if (!methodData) {
      throw new JSONRPCError('Method not found', METHOD_NOT_FOUND)
    }

    const {validateParams, auth, fn} = methodData

    if (validateParams) {
      try {
        validateParams(...args)
      } catch (error) {
        throw new JSONRPCError('Invalid params', INVALID_PARAMS)
      }
    }

    if (auth) {
      if (!user) {
        throw new JSONRPCError('Authentication required', AUTH_REQUIRED)
      }

      const isAuth = await auth(user, ...args)
      if (!isAuth) {
        throw new JSONRPCError('Unauthorized', AUTH_INVALID)
      }
    }

    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      if (typeof error.message === 'string' && typeof error.code === 'number') {
        throw error
      }

      logger.warn({err: error, method, args}, 'JSON-RPC method throws an invalid error')
      throw new JSONRPCError('Internal error', INTERNAL_ERROR)
    }
  })
}

module.exports = createServer
