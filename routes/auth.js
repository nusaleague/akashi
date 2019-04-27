const {Router: router, urlencoded} = require('express')
const passport = require('../lib/passport')

const route = router()

route.get('/auth', (req, res) => {
  res.json(req.user || null)
})

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

      res.sendStatus(200)
    })
  })(req, res, next)
)

for (const provider of ['facebook', 'twitter', 'google']) {
  route.get(`/auth/${provider}`,
    (req, res, next) => {
      req.session.next = req.query.next
      next()
    },
    passport.authenticate(provider)
  )

  route.get(`/auth/${provider}/callback`,
    (req, res, next) => {
      req.log.debug({auth: provider}, 'Auth callback')
      next()
    },
    passport.authenticate(provider),
    (req, res) => {
      req.app.log.debug({auth: provider, user: req.user}, 'Auth successful')

      const {next} = req.session
      delete req.session.next

      switch (next) {
        case 'web':
          res.redirect(process.env.AUTH_CALLBACK_WEB)
          break
        default:
          res.sendFile('./assets/auth-callback.html')
      }
    }
  )
}

module.exports = route
