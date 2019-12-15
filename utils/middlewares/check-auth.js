const { UnauthorizedError, ForbiddenError } = require('../error');
const handle = require('./handle');

function checkAuth(fn = undefined) {
  return handle(
    async req => {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      if (typeof fn !== 'function') {
        return;
      }

      try {
        await fn(req.user);
      } catch (error) {
        if (['fail', 'error'].includes(error.status)) {
          throw error;
        }

        throw new ForbiddenError();
      }
    },
    { middleware: true }
  );
}

module.exports = checkAuth;
