const GoogleStrategy = require('passport-google-oauth20')
const {Passport} = require('passport')
const {Strategy: LocalStrategy} = require('passport-local')
const {Strategy: FacebookStrategy} = require('passport-facebook')
const {Strategy: TwitterStrategy} = require('passport-twitter')
const Haru = require('@tkesgar/haru')
const conn = require('./database')
const logger = require('./log')

const PROVIDERS = {
  facebook: [
    FacebookStrategy,
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      enableProof: true
    }
  ],
  twitter: [
    TwitterStrategy,
    {
      consumerKey: process.env.TWITTER_ID,
      consumerSecret: process.env.TWITTER_SECRET
    }
  ],
  google: [
    GoogleStrategy,
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }
  ]
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

    const [userRow] = await conn('user')
      .where('id', id)
      .select('id', 'name', 'display_name', 'email_hash', 'email_verified')

    if (!userRow) {
      throw new Error('Invalid user object for deserialization')
    }

    Object.assign(data, userRow)

    // TODO Implementasi tabel staff
    if (data.name.startsWith('#')) {
      data.staff = true
    }

    next(null, data)
  })().catch(next)
})

passport.use('staff', new LocalStrategy((name, password, next) => {
  (async () => {
    if (name === null) {
      next(null, false)
      return
    }

    const [userRow] = await conn('user')
      .where('name', name)

    if (!userRow) {
      next(null, false)
      return
    }

    const {password_hash: passwordHash} = userRow
    if (!passwordHash) {
      next(null, false)
      return
    }

    if (!(await Haru.test(passwordHash, password))) {
      next(null, false)
      return
    }

    next(null, {id: userRow.id})
  })().catch(next)
}))

Object.entries(PROVIDERS).forEach(([provider, [Strategy, config]]) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`

  passport.use(provider, new Strategy(
    {
      callbackURL: `${baseUrl}/auth/${provider}/callback`,
      ...config
    },
    (_accessToken, _refreshToken, profile, next) => {
      (async () => {
        const {id: profileId} = profile

        const [userSocialRow] = await conn('user_social')
          .where('provider', provider).andWhere('id', profileId)
          .select(['user_id'])

        if (userSocialRow) {
          const {user_id: userId} = userSocialRow

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
          const info = getProfileInfo(provider, profile)
          const displayName = getProfileDisplayName(provider, info)

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
