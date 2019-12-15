const { ValidationError } = require('../error');
const handle = require('./handle');

function validate(fn) {
  return handle(
    req => {
      try {
        fn(req);
      } catch (error) {
        if (['fail', 'error'].includes(error.status)) {
          throw error;
        }

        throw new ValidationError();
      }
    },
    { middleware: true }
  );
}

module.exports = validate;
