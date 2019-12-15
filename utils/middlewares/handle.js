function handle(value, opts = {}) {
  const { middleware = false } = opts;

  return (req, res, next) =>
    (async () => {
      try {
        const result =
          typeof value === 'function' ? await value(req, res) : value;

        if (middleware) {
          next();
          return;
        }

        if (res.headersSent) {
          return;
        }

        const data = (() => {
          switch (typeof result) {
            case 'bigint':
              return result.toString();
            case 'function':
            case 'symbol':
            case 'undefined':
              return null;
            default:
              return result;
          }
        })();

        res.json({
          status: 'success',
          data
        });
      } catch (error) {
        if (['fail', 'error'].includes(error.status)) {
          const { status, message, code, data } = error;

          const statusCode = (() => {
            if (typeof error.statusCode === 'number') {
              return error.statusCode;
            }

            return error.status === 'fail' ? 400 : 500;
          })();

          res.status(statusCode).json({ status, message, code, data });
          return;
        }

        throw error;
      }
    })().catch(next);
}

module.exports = handle;
