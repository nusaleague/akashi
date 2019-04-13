class JSONRPCError extends Error {
  constructor(message, code, data = null) {
    super(message)

    this.code = code

    if (data) {
      this.data = data
    }
  }
}

class InvalidRequestError extends JSONRPCError {
  constructor() {
    super('Invalid Request', -32700)
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

class InvalidInputError extends JSONRPCError {
  constructor(message = 'Invalid input') {
    super(message, 101)
  }
}

class InvalidExecutionError extends JSONRPCError {
  constructor(message = 'Invalid operation') {
    super(message, 102)
  }
}

class InvalidOutputError extends JSONRPCError {
  constructor(message = 'Invalid operation') {
    super(message, 103)
  }
}

module.exports = {
  JSONRPCError,
  InvalidRequestError,
  MethodNotFoundError,
  InvalidParamsError,
  InternalMethodError,
  AuthRequiredError,
  UnauthorizedError,
  InvalidInputError,
  InvalidExecutionError,
  InvalidOutputError
}
