const passport = require('passport')
const {Router: router, urlencoded, json} = require('express')

const route = router()

route.get('/auth', (req, res) => {
  const {user} = req

  req.app.log.debug({user}, 'Auth: get authenticated user')
  res.json(user || null)
})

route.get('/auth/logout', (req, res) => {
  const {user} = req

  req.logout()

  req.app.log.debug({user}, 'Auth: log out')
  res.sendStatus(204)
})

route.post('/auth/login/staff',
  urlencoded({extended: false}),
  json(),
  (req, res, next) => passport.authenticate('staff', (err, user) => {
    if (err) {
      req.app.log.debug('Auth(staff): error in authentication strategy')
      next(err)
      return
    }

    if (!user) {
      req.app.log.debug('Auth(staff): wrong username and/or password')
      res.sendStatus(401)
      return
    }

    req.login(user, err => {
      if (err) {
        req.app.log.debug('Auth(staff): error in post-authentication login')
        next(err)
        return
      }

      req.app.log.info({auth: user, user: req.user}, 'Auth(staff): login')
      res.sendStatus(200)
    })
  })(req, res, next)
)

route.post('/auth/login/pic',
  urlencoded({extended: false}),
  json(),
  (req, res, next) => passport.authenticate('pic', (err, user) => {
    if (err) {
      req.app.log.debug('Auth(pic): error in authentication strategy')
      next(err)
      return
    }

    if (!user) {
      req.app.log.debug('Auth(pic): wrong username and/or password')
      res.sendStatus(401)
      return
    }

    req.login(user, err => {
      if (err) {
        req.app.log.debug('Auth(pic): error in post-authentication login')
        next(err)
        return
      }

      req.app.log.info({auth: user, user: req.user}, 'Auth(pic): login')
      res.sendStatus(200)
    })
  })(req, res, next)
)

module.exports = route
