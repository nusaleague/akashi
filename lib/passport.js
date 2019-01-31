const {Passport} = require('passport')
const {Strategy: LocalStrategy} = require('passport-local')
const User = require('./database/models/user')

const passport = new Passport()

passport.use('local', new LocalStrategy((username, password, done) => {
  (async () => {
    const user = await User.findByName(username)
    if (!user) {
      done(null, false)
      return
    }

    const {passwordHash} = user
    if (!passwordHash) {
      done(null, false)
      return
    }

    const passwordMatch = await passwordHash.test(password)
    if (!passwordMatch) {
      done(null, false)
      return
    }

    done(null, {
      method: 'password',
      id: user.id
    })
  })().catch(done)
}))

passport.serializeUser((user, done) => {
  const {id} = user

  if (typeof id === 'undefined') {
    done(new Error('Invalid user object for serialization'))
    return
  }

  done(null, id)
})

passport.deserializeUser((id, done) => {
  (async () => {
    const user = await User.findById(id)

    if (!user) {
      throw new Error('Invalid user id for deserialization')
    }

    done(null, await user.getUserData())
  })().catch(done)
})

module.exports = passport
