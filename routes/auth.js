const {Router: createRouter, json} = require('express')
const passport = require('../lib/passport')
const {createComponentLogger} = require('../lib/log')

const authLog = createComponentLogger('auth')

const route = createRouter()

route.get('/auth', (req, res) => {
  const user = req.user || null

  authLog.debug({user}, 'Get current user')
  res.json(user)
})

route.get('/auth/logout', (req, res) => {
  const {user} = req

  req.logout()

  authLog.debug({user}, 'Log out')
  res.sendStatus(204)
})

route.post('/auth/login',
  json(),
  (req, res, next) => passport.authenticate('local', (err, auth) => {
    if (err) {
      authLog.error('Error in authentication strategy')
      next(err)
      return
    }

    if (!auth) {
      authLog.debug('Wrong username and/or password')
      res.sendStatus(401)
      return
    }

    req.login(auth, err => {
      if (err) {
        authLog.error('Error in post-authentication login')
        next(err)
        return
      }

      const {user} = req

      authLog.debug({auth, user}, 'Authentication successful')
      res.sendStatus(200)
    })
  })(req, res, next)
)

module.exports = route
