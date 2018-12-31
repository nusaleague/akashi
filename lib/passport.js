const Haru = require('@tkesgar/haru')
const passport = require('passport')
const {Strategy: LocalStrategy} = require('passport-local')
const conn = require('./database')

passport.use('staff', new LocalStrategy((username, password, done) => {
  (async () => {
    const [user] = await conn('auth_staff')
      .join('auth_user', 'id', 'user_id')
      .where('name', username)
      .select('id', 'password_hash')

    if (!user) {
      done(null, false)
      return
    }

    const hash = Haru.fromJSON(user.password_hash)
    if (!(await hash.test(password))) {
      done(null, false)
      return
    }

    done(null, {
      auth: 'staff',
      id: user.id
    })
  })().catch(done)
}))

passport.use('pic', new LocalStrategy((username, password, done) => {
  (async () => {
    const [user] = await conn('auth_pic')
      .join('auth_user', 'id', 'user_id')
      .where('name', username)
      .select('id', 'password_hash')

    if (!user) {
      return done(null, false)
    }

    const hash = Haru.fromJSON(user.password_hash)
    if (!(await hash.test(password))) {
      return done(null, false)
    }

    return done(null, {
      auth: 'pic',
      id: user.id
    })
  })().catch(done)
}))

passport.serializeUser((user, done) => {
  if (user && user.id) {
    return done(null, user.id)
  }

  return done(new Error('Invalid user object provided for serialization'))
})

passport.deserializeUser((id, done) => {
  (async () => {
    const userData = {}

    const [user] = await conn('auth_user').where('id', id)
    if (!user) {
      throw new Error('Invalid user id provided for deserialization')
    }
    Object.assign(userData, {
      id: user.id,
      name: user.name
    })

    const [staff] = await conn('auth_staff').where('user_id', user.id)
    userData.isStaff = Boolean(staff)

    return done(null, userData)
  })().catch(done)
})
