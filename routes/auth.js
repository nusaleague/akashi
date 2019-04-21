const {Router: router} = require('express')
const passport = require('../lib/passport')

const route = router()

route.get('/auth', (req, res) => {
  res.json(req.user || null)
})

route.get('/auth/logout', (req, res) => {
  req.logout()
  res.sendStatus(204)
})

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
