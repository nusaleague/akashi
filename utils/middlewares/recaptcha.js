const got = require('got');
const { RecaptchaError } = require('../error');
const handle = require('./handle');

function recaptcha(opts = {}) {
  const {
    endpoint = 'https://www.google.com/recaptcha/api/siteverify',
    secret = process.env.RECAPTCHA_SECRET,
    token: tokenFn = req => req.body.recaptcha,
    ip: ipFn = req => req.ip
  } = opts;

  return handle(
    async req => {
      if (process.env.BYPASS_RECAPTCHA) {
        return;
      }

      const response = await got.post(endpoint, {
        json: {
          secret,
          response: tokenFn(req),
          remoteip: typeof ipFn === 'function' ? ipFn(req) : undefined
        },
        responseType: 'json'
      });

      const result = response.body;
      req._recaptcha = result;

      if (!result.success) {
        throw new RecaptchaError(result);
      }
    },
    { middleware: true }
  );
}

module.exports = recaptcha;
