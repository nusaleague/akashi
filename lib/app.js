const path = require('path')
const cookieSession = require('cookie-session')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const {sync: glob} = require('glob')
const env = require('./env')
const passport = require('./passport')
const {log} = require('./log')

const DEFAULT_SECRET = 'DEFAULT_SECRET'

function createApp() {
  const app = express()

  // Load env (jika belum di-load).
  env.loadEnv()

  app
    // 'env': nama environment
    .set('env', env.getEnv())
    // 'trust proxy': set proxy di depan app Express
    // Docs: http://expressjs.com/en/guide/behind-proxies.html
    .set('trust proxy', JSON.parse(process.env.TRUST_PROXY))

  // Tambah default logger di app.log.
  app.log = log

  // Tambah getter untuk child logger di req.log dan res.log:
  //   - req.log: log request
  //   - res.log: log request + response
  app.use((req, res, next) => {
    Object.defineProperty(req, 'log', {
      get: () => req.app.log.child({req})
    })
    Object.defineProperty(res, 'log', {
      get: () => req.app.log.child({res})
    })

    next()
  })

  // Load middleware helmet.
  app.use(helmet())

  // Load middleware untuk setup CORS header.
  //   - Development: semua CORS boleh.
  //   - Production: hanya boleh dari nusaleague.com.
  app.use(cors({
    origin: env.isDevelopment() ? true : /nusaleague\.com$/,
    credentials: true
  }))

  // Ambil SECRET dari env.
  // Jika masih memakai DEFAULT_SECRET (dari default.env), kasih warning.
  const {SECRET: secret} = process.env
  if (secret === DEFAULT_SECRET) {
    app.log.warn('Using default secret string; please override SECRET env.')
  }

  // Load middleware untuk session storage via cookies.
  app.use(cookieSession({secret}))

  // Load middleware autentikasi via Passport.js.
  app.use(passport.initialize())
  app.use(passport.session())

  // Load routes.
  const routesPath = path.resolve('./routes/*.js')
  const routes = glob(routesPath).map(routePath => require(routePath))
  if (routes.length > 0) {
    app.use(routes)
  } else {
    app.log.warn('No routes specified; all requests will be responded with 404')
  }

  // Handle request yang tidak ada route (404).
  app.all('*', (req, res) => {
    req.app.log.debug(`No route available for '${req.originalUrl}'`)
    res.sendStatus(404)
  })

  // Error-handling middleware:
  //   - Jika header sudah dikirim: fatal error
  //   - Jika header belum dikirim: unhandled error
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      res.log.fatal({err}, 'Unhandled server error (headers already sent)')
      next(err)
      return
    }

    req.log.error({err}, 'Unhandled server error')
    res.sendStatus(500)
  })

  return app
}

module.exports = createApp
