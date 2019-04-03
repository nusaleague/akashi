class JSONRPCError extends Error {
  constructor(message, code, data = null) {
    super(message)

    this.code = code

    if (data) {
      this.data = data
    }
  }
}
exports.JSONRPCError = JSONRPCError

class MethodNotFoundError extends JSONRPCError {
  constructor() {
    super('Method not found', -32601)
  }
}
exports.MethodNotFoundError = MethodNotFoundError

class InvalidParamsError extends JSONRPCError {
  constructor() {
    super('Invalid params', -32602)
  }
}
exports.InvalidParamsError = InvalidParamsError

class InternalMethodError extends JSONRPCError {
  constructor() {
    super('Internal error', -32603)
  }
}
exports.InternalMethodError = InternalMethodError

class AuthRequiredError extends JSONRPCError {
  constructor() {
    super('Authentication required', -32001)
  }
}
exports.AuthRequiredError = AuthRequiredError

class UnauthorizedError extends JSONRPCError {
  constructor() {
    super('Unauthorized', -32003)
  }
}
exports.UnauthorizedError = UnauthorizedError

class IllegalOperationError extends JSONRPCError {
  constructor(message = 'Operation not allowed') {
    super(message, 101)
  }
}
exports.IllegalOperationError = IllegalOperationError

class InvalidInputError extends JSONRPCError {
  constructor(message = 'Invalid vote response') {
    super(message, 102)
  }
}
exports.InvalidInputError = InvalidInputError

