const GoogleStrategy = require('passport-google-oauth20')
const {Passport} = require('passport')
const {Strategy: FacebookStrategy} = require('passport-facebook')
const {Strategy: LocalStrategy} = require('passport-local')
const {Strategy: TwitterStrategy} = require('passport-twitter')
const Haru = require('@tkesgar/haru')
const conn = require('./database/connection')
const logger = require('./log')
const {BASE_URL} = require('./env')

const SOCIALS = {
  facebook: {
    Strategy: FacebookStrategy,
    config: {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      enableProof: true
    }
  },
  twitter: {
    Strategy: TwitterStrategy,
    config: {
      consumerKey: process.env.TWITTER_ID,
      consumerSecret: process.env.TWITTER_SECRET
    }
  },
  google: {
    Strategy: GoogleStrategy,
    config: {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }
  }
}

const log = logger.child({sub: 'passport'})

const passport = new Passport()

passport.serializeUser((user, next) => {
  if (!user.id) {
    next(new Error('Invalid user object for serialization'))
    return
  }

  next(null, user.id)
})

passport.deserializeUser((id, next) => {
  (async () => {
    const data = {}

    const [user] = await conn('user')
      .where('id', id)
      .select('id', 'name', 'display_name', 'email_hash', 'email_verified')

    if (!user) {
      throw new Error('Invalid user object for deserialization')
    }

    Object.assign(data, user)

    const [staff] = await conn('staff')
      .where('user_id', id)
      .select('roles')

    if (staff) {
      data.staff = {
        roles: staff.roles.split(',')
      }
    }

    data.gravatar = user.gravatar || '00000000000000000000000000000000'

    next(null, data)
  })().catch(next)
})

passport.use('staff', new LocalStrategy((name, password, next) => {
  (async () => {
    const [user] = await conn('user')
      .where('name', name)
      .select('id', 'password_hash')

    if (!user) {
      next(null, false)
      return
    }

    const passwordHash = user.password_hash
    if (!passwordHash) {
      next(null, false)
      return
    }

    const match = await Haru.test(passwordHash, password)
    if (!match) {
      next(null, false)
      return
    }

    const [staff] = await conn('staff')
      .where('user_id', user.id)
      .select('user_id')
    if (!staff) {
      next(null, false)
      return
    }

    next(null, {id: user.id})
  })().catch(next)
}))

Object.entries(SOCIALS).forEach(([provider, {Strategy, config}]) => {
  passport.use(provider, new Strategy(
    {
      callbackURL: `${BASE_URL}/auth/${provider}/callback`,
      ...config
    },
    (_accessToken, _refreshToken, profile, next) => {
      (async () => {
        const profileId = profile.id

        const [social] = await conn('user_social')
          .where('provider', provider).andWhere('id', profileId)
          .select(['user_id'])

        if (social) {
          const userId = social.user_id

          try {
            const info = getProfileInfo(provider, profile)
            await conn('user_social')
              .where('provider', provider).andWhere('id', profileId)
              .update({
                // eslint-disable-next-line camelcase
                info_json: JSON.stringify(info)
              })
          } catch (error) {
            log.warn({provider, userId}, 'Failed to update social info')
          }

          next(null, {id: userId})
          return
        }

        const userId = await conn.transaction(async trx => {
          const displayName = getProfileDisplayName(provider, info)
          const info = getProfileInfo(provider, profile)

          const [userId] = await trx('user').insert({
            // eslint-disable-next-line camelcase
            display_name: displayName
          })

          await trx('user_social').insert({
            /* eslint-disable camelcase */
            provider,
            id: profileId,
            user_id: userId,
            info_json: JSON.stringify(info)
            /* eslint-enable camelcase */
          })

          return userId
        })

        next(null, {id: userId})
      })().catch(next)
    }
  ))
})

module.exports = passport

function getProfileInfo(provider, profile) {
  switch (provider) {
    case 'facebook':
      return profile._json
    default:
      return profile
  }
}

function getProfileDisplayName(provider, profile) {
  switch (provider) {
    case 'facebook':
      return profile.name
    default:
      return `Tamu #${Date.now()}`
  }
}
