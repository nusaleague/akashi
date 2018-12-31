const passport = require('passport')
const {Router: router, urlencoded, json} = require('express')

const route = router()

route.get('/auth', (req, res) => {
  const {user = null} = req

  req.app.log.debug({user}, 'Get auth')
  res.json(user)
})

route.get('/auth/logout', (req, res) => {
  const {user} = req

  req.logout()

  req.app.log.debug({user}, 'Log out')
  return res.sendStatus(204)
})

route.use('/auth/login/staff',
  urlencoded({extended: false}),
  json()
)

route.post('/auth/login/staff', (req, res, next) => {
  passport.authenticate('staff', (err, user) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      req.app.log.debug('Staff login: wrong username and/or password')
      return res.sendStatus(401)
    }

    req.login(user, err => {
      if (err) {
        return next(err)
      }

      req.app.log.info({user: req.user}, 'Staff login')
      return res.sendStatus(200)
    })
  })(req, res, next)
})

route.post('/auth/login/pic', (req, res, next) => {
  passport.authenticate('pic', (err, user) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      req.app.log.debug('PIC login: wrong username and/or password')
      return res.sendStatus(401)
    }

    req.login(user, err => {
      if (err) {
        return next(err)
      }

      req.app.log.info({user: req.user}, 'PIC login')
      return res.sendStatus(200)
    })
  })(req, res, next)
})

module.exports = route
