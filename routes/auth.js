const {Router: router, urlencoded} = require('express')
const passport = require('../lib/passport')

const REDIRECT_MAP = {
  web: process.env.AUTH_CALLBACK_WEB
}

const route = router()

route.get('/auth', (req, res) => res.json(req.user || null))

route.get('/auth/logout', (req, res) => {
  req.logout()
  res.sendStatus(204)
})

route.post('/auth/staff',
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

      req.app.log.debug({auth: 'staff', user: req.user}, 'Auth successful')
      res.sendStatus(200)
    })
  })(req, res, next)
)

for (const provider of ['facebook', 'twitter', 'google']) {
  route.get(`/auth/${provider}`,
    (req, res, next) => {
      const key = req.query.next

      const redirect = REDIRECT_MAP[key]
      if (!redirect) {
        req.app.log.debug({auth: provider, key}, 'Invalid auth redirect key (pre-auth)')
        res.sendStatus(400)
        return
      }

      req.session.authRedirect = redirect
      next()
    },
    passport.authenticate(provider)
  )

  route.get(`/auth/${provider}/callback`,
    (req, res, next) => {
      req.log.debug({auth: provider}, 'Callback')
      next()
    },
    passport.authenticate(provider),
    (req, res) => {
      req.app.log.debug({auth: provider, user: req.user}, 'Auth successful')

      const redirect = req.session.authRedirect
      delete req.session.authRedirect

      res.redirect(redirect)
    }
  )
}

module.exports = route
