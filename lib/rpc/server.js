const Server = require('@tkesgar/chihiro/lib/server')
const {createComponentLogger} = require('../log')

const rpcLog = createComponentLogger('rpc')

function createServer(methods, user) {
  return new Server(async (method, params) => {
    const methodInfo = methods[method]
    if (!methodInfo) {
      rpcLog.debug({method}, 'Method not available')
      throw new MethodNotFoundError()
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
        rpcLog.debug({method}, 'mapParams not available')
        throw new InvalidParamsError()
      }

      return mapParams(params)
    })()

    if (validateArgs) {
      try {
        validateArgs(...args)
      } catch (error) {
        rpcLog.debug({err: error, method, args}, 'validateArgs failed')
        throw new InvalidParamsError()
      }
    }

    if (auth) {
      if (!user) {
        rpcLog.debug({method}, 'Authentication required')
        throw new AuthRequiredError()
      }

      const authorized = await auth(user, ...args)
      if (!authorized) {
        rpcLog.debug({method, user, args}, 'User not allowed')
        throw new UnauthorizedError()
      }
    }

    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      if (typeof error.message === 'string' && typeof error.code === 'number') {
        throw error
      }

      rpcLog.warn({err: error, method, params}, `Method '${method}' throws an invalid error`)
      throw new InternalMethodError()
    }
  })
}

module.exports = createServer

class JSONRPCError extends Error {
  constructor(message, code, data) {
    super(message)

    this.code = code

    if (typeof data !== 'undefined') {
      this.data = data
    }
  }
}

class MethodNotFoundError extends JSONRPCError {
  constructor() {
    super('Method not found', -32601)
  }
}

class InvalidParamsError extends JSONRPCError {
  constructor() {
    super('Invalid params', -32602)
  }
}

class InternalMethodError extends JSONRPCError {
  constructor() {
    super('Internal error', -32603)
  }
}

class AuthRequiredError extends JSONRPCError {
  constructor() {
    super('Authentication required', -32001)
  }
}

class UnauthorizedError extends JSONRPCError {
  constructor() {
    super('Unauthorized', -32003)
  }
}
