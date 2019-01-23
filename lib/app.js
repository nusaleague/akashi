const path = require('path')
const cookieSession = require('cookie-session')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const {sync: glob} = require('glob')
const logger = require('./log')
const passport = require('./passport')
const {dev, env} = require('./env')

const DEFAULT_SECRET = 'DEFAULT_SECRET'

const app = express()

app.use((req, res, next) => {
  Object.defineProperty(req, 'log', {
    get: () => logger.child({req})
  })

  Object.defineProperty(res, 'log', {
    get: () => logger.child({res})
  })

  next()
})

app.set('env', env)

app.set('trust proxy', JSON.parse(process.env.TRUST_PROXY))

app.use(helmet())

app.use(cors({
  origin: dev ? true : /nusaleague\.com$/,
  credentials: true
}))

app.use(cookieSession({
  secret: (() => {
    const {SECRET: secret} = process.env

    if (!secret) {
      throw new Error('SECRET env is not provided')
    }

    if (secret === DEFAULT_SECRET) {
      logger.warn('Using default secret string; please override SECRET env.')
    }

    return secret
  })()
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(glob(path.resolve('./routes/*.js')).map(routePath => require(routePath)))

app.all('*', (req, res) => {
  logger.debug({url: req.originalUrl}, 'Route not available')
  res.sendStatus(404)
})

app.use((err, req, res, next) => {
  if (res.headersSent) {
    res.log.fatal({err}, 'Unhandled server error (headers already sent)')
    next(err)
    return
  }

  req.log.error({err}, 'Unhandled server error')
  res.sendStatus(500)
})

module.exports = app
