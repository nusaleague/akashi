const passport = require('passport')
const {Router: router, urlencoded} = require('express')

const route = router()

route.get('/auth', (req, res) => res.json(req.user || null))

route.get('/auth/logout', (req, res) => {
  req.logout()
  return res.sendStatus(204)
})

route.post('/auth/login/staff',
  urlencoded({extended: false}),
  (req, res, next) => passport.authenticate('staff', (err, user) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.sendStatus(401)
    }

    req.login(user, err => {
      if (err) {
        return next(err)
      }

      return res.sendStatus(200)
    })
  })(req, res, next)
)

route.post('/auth/login/pic',
  urlencoded({extended: false}),
  (req, res, next) => passport.authenticate('pic', (err, user) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.sendStatus(401)
    }

    req.login(user, err => {
      if (err) {
        return next(err)
      }

      return res.sendStatus(200)
    })
  })(req, res, next)
)

module.exports = route
