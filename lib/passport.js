const Haru = require('@tkesgar/haru')
const passport = require('passport')
const {Strategy: LocalStrategy} = require('passport-local')
const conn = require('./database')

passport.use('password', new LocalStrategy((name, password, done) => {
  (async () => {
    const [user] = await conn('user')
      .where({name})
      .select('id', 'password_hash')

    if (!user) {
      done(null, false)
      return
    }

    const match = await Haru.fromJSON(user.password_hash).test(password)
    if (!match) {
      done(null, false)
      return
    }

    done(null, {
      id: user.id
    })
  })().catch(done)
}))

passport.serializeUser((user, done) => {
  const {id} = user

  if (typeof id !== 'number') {
    done(new Error('Invalid user object provided for serialization'))
    return
  }

  done(null, {id})
})

passport.deserializeUser((data, done) => {
  (async () => {
    const userData = {}

    const [user] = await conn('user').where({id: data.id}).select('id', 'name')
    if (!user) {
      throw new Error('Invalid user data provided for deserialization')
    }

    Object.assign(userData, {
      id: user.id,
      name: user.name
    })

    const [staff] = await conn('staff').where({user_id: user.id})
    if (staff) {
      Object.assign(userData, {
        staff: {
          roles: staff.roles.split(',')
        }
      })
    }

    const [pic] = await conn('pic').where({user_id: user.id})
    if (pic) {
      const [org] = await conn('org').where({id: pic.org_id}).select('id', 'slug', 'short_name')
      const mascots = await conn('mascot').where({org_id: pic.org_id}).select('id', 'slug', 'short_name')
      Object.assign(userData, {
        pic: {
          org: {
            id: org.id,
            slug: org.slug,
            name: org.short_name
          },
          mascots: mascots.map(mascot => ({
            id: mascot.id,
            slug: mascot.slug,
            name: mascot.short_name
          }))
        }
      })
    }

    done(null, userData)
  })().catch(done)
})
