const crypto = require('crypto')
const GoogleStrategy = require('passport-google-oauth20')
const {Passport} = require('passport')
const {Strategy: FacebookStrategy} = require('passport-facebook')
const {Strategy: LocalStrategy} = require('passport-local')
const {Strategy: TwitterStrategy} = require('passport-twitter')
const Haru = require('@tkesgar/haru')
const conn = require('./database/connection')
const logger = require('./log')
const {BASE_URL} = require('./env')

const log = logger.child({sub: 'passport'})

const passport = new Passport()

const socials = {
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

passport.serializeUser((user, done) => {
  const {id} = user
  if (!id) {
    done(new Error('Invalid user object for serialization'))
    return
  }

  done(null, id)
})

passport.deserializeUser((id, next) => {
  (async () => {
    const data = {}

    const [user] = await conn('user')
      .where('id', id)
      .select('id', 'name', 'display_name', 'email_verified')

    if (!user) {
      throw new Error('Invalid user object for deserialization')
    }

    Object.assign(data, user)

    data.hash = crypto.createHash('md5').update(String(user.id)).digest('hex')

    next(null, data)
  })().catch(next)
})

passport.use('password', new LocalStrategy((name, password, next) => {
  (async () => {
    const [user] = await conn('user')
      .where('name', name)
      .select('id', 'password_hash')

    if (!user) {
      next(null, false)
      return
    }

    const {password_hash: passwordHash} = user
    if (!passwordHash) {
      next(null, false)
      return
    }

    const match = await Haru.test(passwordHash, password)
    if (!match) {
      next(null, false)
      return
    }

    next(null, {id: user.id})
  })().catch(next)
}))

for (const provider of ['facebook', 'twitter', 'google']) {
  const {Strategy, config} = socials[provider]

  passport.use(provider, new Strategy(
    {
      ...config,
      callbackURL: `${BASE_URL}/auth/${provider}/callback`
    },
    (_accessToken, _refreshToken, profile, next) => {
      (async () => {
        const [social] = await conn('user_social')
          .where('provider', provider).andWhere('id', profile.id)
          .select(['user_id'])

        if (social) {
          const {user_id: userId} = social

          try {
            await conn('user_social')
              .where('provider', provider).andWhere('id', profile.id)
              .update({
                /* eslint-disable camelcase */
                info_json: JSON.stringify(getProfileData(provider, profile))
                /* eslint-enable camelcase */
              })
          } catch (error) {
            log.warn({provider, userId}, 'Failed to update social info')
          }

          next(null, {id: userId})
          return
        }

        const userId = await conn.transaction(async trx => {
          const profileData = getProfileData(provider, profile)

          const [userId] = await trx('user').insert({
            /* eslint-disable camelcase */
            display_name: getNewUserDisplayName(provider, profileData)
            /* eslint-enable camelcase */
          })

          await trx('user_social').insert(
            {
              /* eslint-disable camelcase */
              provider,
              id: profile.id,
              user_id: userId,
              info_json: JSON.stringify(profileData)
              /* eslint-enable camelcase */
            }
          )

          return userId
        })

        next(null, {id: userId})
      })().catch(next)
    }
  ))
}

module.exports = passport

function getProfileData(provider, profile) {
  switch (provider) {
    case 'facebook':
      return profile._json
    default:
      return profile
  }
}

function getNewUserDisplayName(provider, profile) {
  // Facebook
  if (profile.name) {
    return profile.name
  }

  // Fallback
  return `Nusa Fan #${Date.now()}`
}
