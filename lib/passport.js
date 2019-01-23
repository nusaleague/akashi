const {Passport} = require('passport')
const {Strategy: LocalStrategy} = require('passport-local')
const auth = require('./database/auth')

const passport = new Passport()

passport.use('password', new LocalStrategy((username, password, done) => {
  (async () => {
    done(null, await auth.authByPassword(username, password))
  })().catch(done)
}))

passport.serializeUser((user, done) => {
  const {id} = user

  if (typeof id === 'undefined') {
    done(new Error('Invalid user object for serialization'))
  }

  done(null, id)
})

passport.deserializeUser((id, done) => {
  (async () => {
    done(null, await auth.getUserData(id))
  })().catch(done)
})

module.exports = passport
