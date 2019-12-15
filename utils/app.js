const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const csurf = require('csurf');
const cookieSession = require('cookie-session');
const routes = require('../routes');
const { isDevelopment } = require('./env');
const handle = require('./middlewares/handle');
const passport = require('./passport');
const { NotFoundError } = require('./error');

function createApp() {
  return express()
    .set('view engine', 'ejs')
    .set('trust proxy', JSON.parse(process.env.TRUST_PROXY))
    .use([
      helmet(),
      cors({
        origin: isDevelopment ? true : /nusaleague\.com$/,
        credentials: true
      }),
      cookieSession({
        secret: process.env.SECRET,
        maxAge: 14 * 24 * 3600 * 1000,
        sameSite: 'strict'
      }),
      csurf(),
      (req, res, next) => {
        res.cookie('csrf-token', req.csrfToken(), {
          secure: req.protocol === 'https',
          sameSite: 'strict'
        });

        next();
      },
      passport.initialize(),
      passport.session(),
      express.json(),
      express.urlencoded({ extended: false })
    ])
    .use(routes)
    .all(
      '*',
      handle(() => {
        throw new NotFoundError();
      })
    )
    .use((err, req, res, next) => {
      if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).json({
          status: 'failed',
          message: 'Invalid CSRF token',
          code: 'F_INVALID_CSRF_TOKEN'
        });
      }

      next(err);
    });
}

module.exports = createApp;
