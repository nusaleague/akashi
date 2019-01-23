const passport = require('passport')
const {Router: router, urlencoded, json} = require('express')
const logger = require('../lib/log')

const route = router()

route.get('/auth', (req, res) => {
  const user = req.user || null

  logger.debug({user}, 'Auth: get current user')
  res.json(user)
})

route.get('/auth/logout', (req, res) => {
  const {user} = req

  req.logout()

  logger.debug({user}, 'Auth: log out')
  res.sendStatus(204)
})

route.post('/auth/login/form',
  json(),
  urlencoded({extended: false}),
  (req, res, next) => passport.authenticate('password', (err, auth) => {
    if (err) {
      logger.error('Auth: error in authentication strategy')
      next(err)
      return
    }

    if (!auth) {
      logger.debug('Auth: wrong username and/or password')
      res.sendStatus(401)
      return
    }

    req.login(auth, err => {
      if (err) {
        logger.error('Auth: error in post-authentication login')
        next(err)
        return
      }

      logger.debug({auth, user: req.user}, 'Auth: authentication successful')
      res.sendStatus(200)
    })
  })(req, res, next)
)

module.exports = route
