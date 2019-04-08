const {Router: router, urlencoded} = require('express')
const passport = require('../lib/passport')
const createRateLimit = require('../lib/rate-limit')

const redirectMap = {
  web: process.env.AUTH_CALLBACK_WEB
}

const route = router()

route.get('/auth',
  createRateLimit('rl-login:', 60), // 30 req/menit
  (req, res) => {
    res.json(req.user || null)
  }
)

route.get('/auth/logout',
  (req, res) => {
    req.app.log.debug({user: req.user}, 'Log out')

    req.logout()
    res.sendStatus(204)
  }
)

route.post('/auth/staff',
  createRateLimit('rl-login:', 30), // 30 req/menit
  urlencoded({extended: false}),
  (req, res, next) => passport.authenticate('staff', (err, user) => {
    if (err) {
      next(err)
      return
    }

    if (!user) {
      res.sendStatus(401)
      return
    }

    req.login(user, err => {
      if (err) {
        next(err)
        return
      }

      res.sendStatus(200)
    })
  })(req, res, next)
)

for (const provider of ['facebook', 'twitter', 'google']) {
  route.get(`/auth/${provider}`,
    createRateLimit('rl-login:', 30), // 30 req/menit
    (req, res, next) => {
      const {next: redirectKey} = req.query

      if (!redirectMap[redirectKey]) {
        req.app.log.debug({key: redirectKey}, 'Invalid auth redirect key (pre-auth)')
        res.sendStatus(400)
        return
      }

      req.session.authRedirect = redirectKey
      next()
    },
    passport.authenticate(provider)
  )

  route.get(`/auth/${provider}/callback`,
    (req, res, next) => {
      req.log.debug({provider}, 'Auth callback')
      next()
    },
    passport.authenticate(provider),
    (req, res) => {
      req.app.log.debug({provider, user: req.user}, 'Auth successful')

      const redirectKey = req.session.authRedirect
      delete req.session.authRedirect

      const url = redirectMap[redirectKey]
      if (!url) {
        req.app.log.debug({key: redirectKey}, 'Invalid auth redirect key (post-auth)')
        res.sendStatus(400)
        return
      }

      res.redirect(url)
    }
  )
}

module.exports = route
