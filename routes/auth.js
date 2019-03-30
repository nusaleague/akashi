const path = require('path')
const {Router: router, urlencoded} = require('express')
const passport = require('../lib/passport')

const route = router()

route.get('/auth', (req, res) => {
  const {user = null} = req

  req.app.log.debug({user})
  res.json(user)
})

route.get('/auth/logout', (req, res) => {
  req.app.log.debug({user: req.user}, 'Log out')

  req.logout()

  res.sendStatus(204)
})

route.post('/auth/login',
  urlencoded({extended: false}),
  (req, res, next) => passport.authenticate('password', (err, user) => {
    if (err) {
      next(err)
      return
    }

    if (!user) {
      req.app.log.debug({strategy: 'password'}, 'Auth failed')
      res.status(401).json({
        type: 'AUTH_INVALID',
        message: 'Invalid username or password'
      })
      return
    }

    req.login(user, err => {
      if (err) {
        next(err)
        return
      }

      next()
    })
  })(req, res, next),
  (req, res) => {
    req.app.log.debug({strategy: 'password', user: req.user}, 'Auth successful')
    res.json(req.user)
  }
)

for (const provider of ['facebook', 'twitter', 'google']) {
  route.get(`/auth/${provider}`, passport.authenticate(provider))

  route.get(`/auth/${provider}/callback`,
    (req, res, next) => {
      req.log.debug({provider}, 'Auth callback')
      next()
    },
    passport.authenticate(provider),
    (req, res) => {
      req.app.log.debug({provider, user: req.user}, 'Auth successful')
      res.sendFile(path.resolve('./assets/callback.html'))
    }
  )
}

module.exports = route
