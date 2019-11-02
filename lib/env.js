const fs = require('fs');
const dotenv = require('dotenv');

function loadEnv(path) {
  return fs.existsSync(path) ? dotenv.parse(fs.readFileSync(path)) : {};
}

function createEnv(paths = ['./default.env', './.env'], initialValue = {}) {
  const env = initialValue;

  for (const path of paths) {
    Object.assign(env, loadEnv(path));
  }

  Object.assign(env, {
    dev: env.NODE_ENV === 'development',
    baseurl: env.BASE_URL || `http://localhost:${env.PORT}`,
    authRedirect: env.AUTH_REDIRECT.split(';').reduce((dict, entry) => {
      const [key, val] = entry.split('=').map(str => str.trim());
      return Object.assign(dict, {[key]: val});
    }, {})
  });

  return env;
}

exports.createEnv = createEnv;

const defaultInstance = createEnv();

exports.env = defaultInstance;
