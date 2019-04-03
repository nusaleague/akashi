const {Router: router} = require('express')
const passport = require('../lib/passport')

const redirectMap = {
  web: process.env.AUTH_CALLBACK_WEB
}

const route = router()

route.get('/auth', (req, res) => {
  const {user = null} = req
  res.json(user)
})

route.get('/auth/logout', (req, res) => {
  req.app.log.debug({user: req.user}, 'Log out')

  req.logout()
  res.sendStatus(204)
})

for (const provider of ['facebook', 'twitter', 'google']) {
  route.get(`/auth/${provider}`,
    (req, res, next) => {
      const {next: redirectKey} = req.query

      if (!redirectMap[redirectKey]) {
        req.app.log.debug({key: redirectKey}, 'Invalid auth redirect key (pre-auth)')
        res.status(400).json({
          type: 'INVALID_AUTH_REDIRECT',
          message: 'Invalid authentication redirect'
        })
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
        res.status(400).json({
          type: 'INVALID_AUTH_REDIRECT',
          message: 'Invalid authentication redirect'
        })
        return
      }

      res.redirect(url)
    }
  )
}

module.exports = route
