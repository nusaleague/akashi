const path = require('path')
const cookieSession = require('cookie-session')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const {sync: glob} = require('glob')
const logger = require('./log')
const {ENV} = require('./env')
const passport = require('./passport')
const {DEVELOPMENT} = require('./env')

const app = express()

app.log = logger

app.set('env', ENV)
app.set('trust proxy', JSON.parse(process.env.TRUST_PROXY))

app.use((req, res, next) => {
  Object.defineProperty(req, 'log', {
    get: () => req.app.log.child({sub: 'request', req})
  })

  Object.defineProperty(res, 'log', {
    get: () => req.app.log.child({sub: 'response', req, res})
  })

  next()
})

app.use(helmet())

app.use(cors({
  origin: DEVELOPMENT ? true : /nusaleague\.com$/,
  credentials: true
}))

app.use(cookieSession({
  secret: process.env.SECRET,
  maxAge: 14 * 24 * 3600 * 1000
}))

app.use(passport.initialize())
app.use(passport.session())

if (DEVELOPMENT) {
  app.use(morgan('dev'))
}

glob('./routes/**/*.js')
  .filter(routePath => !path.basename(routePath).startsWith('_'))
  .sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
  .map(routePath => require(path.resolve(routePath)))
  .forEach(route => app.use(route))

app.all('*', (req, res) => res.sendStatus(404))

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
