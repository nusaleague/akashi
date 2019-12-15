class AppError extends Error {
  constructor(message, status, statusCode, opts = {}) {
    const { code, data } = opts;

    super(message);

    this.status = status;
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
  }
}

exports.AppError = AppError;

class ClientError extends AppError {
  constructor(message, opts = {}) {
    const { statusCode = 400, code, data } = opts;

    super(message, 'fail', statusCode, { code, data });
  }
}

exports.ClientError = ClientError;

class ServerError extends AppError {
  constructor(message, opts = {}) {
    const { statusCode = 500, code, data } = opts;

    super(message, 'error', statusCode, { code, data });
  }
}

exports.ServerError = ServerError;

class ValidationError extends ClientError {
  constructor(message = 'Invalid request', data = undefined) {
    super(message, { statusCode: 422, code: 'F_INVALID', data });
  }
}

exports.ValidationError = ValidationError;

class UnauthorizedError extends ClientError {
  constructor(message = 'Unauthorized request are not allowed') {
    super(message, { statusCode: 401, code: 'F_UNAUTHORIZED' });
  }
}

exports.UnauthorizedError = UnauthorizedError;

class ForbiddenError extends ClientError {
  constructor(message = 'Access to resource is forbidden') {
    super(message, { statusCode: 403, code: 'F_FORBIDDEN' });
  }
}

exports.ForbiddenError = ForbiddenError;

class NotFoundError extends ClientError {
  constructor(message = 'Resource does not exist') {
    super(message, { statusCode: 404, code: 'F_NOT_FOUND' });
  }
}

exports.NotFoundError = NotFoundError;

class RecaptchaError extends ClientError {
  constructor(result) {
    super('reCAPTCHA verification failed', {
      statusCode: 401,
      code: 'F_RECAPTCHA_VERIFY_FAILED'
    });

    this.recaptchaResult = result;
  }
}

exports.RecaptchaError = RecaptchaError;
