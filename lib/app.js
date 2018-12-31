const path = require('path')
const cookieSession = require('cookie-session')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const passport = require('passport')
const {sync: glob} = require('glob')
const log = require('./log')
const {dev, env} = require('./env')

const DEFAULT_SECRET = 'Gq8Rv4iDdrgr1aoy0RESkK1IBTQSUtMaEtpE'

/* eslint-disable-next-line import/no-unassigned-import */
require('./passport')

const app = express()

app.log = log

app.use((req, res, next) => {
  Object.defineProperty(req, 'log', {
    get: () => req.app.log.child({req})
  })

  Object.defineProperty(res, 'log', {
    get: () => req.log.child({res})
  })

  return next()
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
      app.log.warn('Using default secret string; please override SECRET env.')
    }

    return secret
  })()
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(glob(path.resolve('routes/*.js')).map(routePath => require(routePath)))

app.all('*', (req, res) => {
  app.log.debug({url: req.originalUrl}, 'Route not available')
  return res.sendStatus(404)
})

app.use((err, req, res, next) => {
  if (res.headersSent) {
    res.log.fatal({err}, 'Unhandled Express error (headers already sent)')
    return next(err)
  }

  req.log.error({err}, 'Unhandled server error')

  return res.sendStatus(500)
})

module.exports = app
