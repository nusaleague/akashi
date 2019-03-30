const GoogleStrategy = require('passport-google-oauth20')
const Haru = require('@tkesgar/haru')
const {Passport} = require('passport')
const {Strategy: FacebookStrategy} = require('passport-facebook')
const {Strategy: LocalStrategy} = require('passport-local')
const {Strategy: TwitterStrategy} = require('passport-twitter')
const conn = require('./database/connection')
const logger = require('./log')
const {BASE_URL} = require('./env')

const log = logger.child({sub: 'passport'})

const passport = new Passport()

passport.use('local', createLocalStrategy())

passport.use('facebook', createSocialStrategy('facebook'))
passport.use('twitter', createSocialStrategy('twitter'))
passport.use('google', createSocialStrategy('google'))

passport.serializeUser((user, done) => {
  (async () => {
    const id = await serializeUser(user)
    done(null, id)
  })().catch(done)
})

passport.deserializeUser((id, done) => {
  (async () => {
    const user = await deserializeUser(id)
    done(null, user)
  })().catch(done)
})

module.exports = passport

async function serializeUser(user) {
  const {id} = user
  if (!id) {
    throw new Error('Invalid user object for serialization')
  }

  return id
}

async function deserializeUser(id) {
  const user = {}

  const [userRow] = await conn('user')
    .where('id', id)
    .select('id', 'name', 'display_name', 'email_verified')

  if (!userRow) {
    throw new Error('Invalid user id for deserialization')
  }

  Object.assign(user, userRow)

  return user
}

function createLocalStrategy() {
  return new LocalStrategy((username, password, done) => {
    (async () => {
      const user = await verifyPassword(username, password)
      done(null, user)
    })().catch(done)
  })
}

async function verifyPassword(username, password) {
  if (!username) {
    return false
  }

  const [userRow] = await conn('user').where('name', username)
  if (!userRow) {
    return false
  }

  const {password_hash: passwordHash} = userRow
  if (!passwordHash) {
    return false
  }

  const match = await Haru.test(passwordHash, password)
  if (!match) {
    return false
  }

  return {id: userRow.id}
}

function createSocialStrategy(provider) {
  const Strategy = getSocialStrategy(provider)
  const config = getSocialStrategyConfig(provider)

  return new Strategy(
    {
      ...config,
      callbackURL: `${BASE_URL}/auth/${provider}/callback`
    },
    (token1, token2, profile, done) => {
      (async () => {
        const user = await verifySocialProfile(provider, profile)
        done(null, user)
      })().catch(done)
    }
  )
}

async function verifySocialProfile(provider, profile) {
  const [socialRow] = await conn('user_social')
    .where('provider', provider).andWhere('id', profile.id)
    .select(['user_id', 'verified'])

  if (socialRow) {
    const {user_id: userId} = socialRow

    try {
      await conn('user_social')
        .where('provider', provider).andWhere('id', profile.id)
        .update({
          /* eslint-disable camelcase */
          info_json: getSocialProfileJSON(provider, profile)
          /* eslint-enable camelcase */
        })
    } catch (error) {
      log.warn({provider, userId}, 'Failed to update social info')
    }

    return {id: userId}
  }

  const userId = await conn.transaction(async trx => {
    const [userId] = await trx('user').insert({
      /* eslint-disable camelcase */
      display_name: getNewUserDisplayName(provider, profile)
      /* eslint-enable camelcase */
    })

    await trx('user_social').insert(
      {
        /* eslint-disable camelcase */
        provider,
        id: profile.id,
        user_id: userId,
        info_json: getSocialProfileJSON(provider, profile)
        /* eslint-enable camelcase */
      }
    )

    return userId
  })
  return {
    id: userId
  }
}

function getSocialStrategy(provider) {
  switch (provider) {
    case 'facebook':
      return FacebookStrategy
    case 'twitter':
      return TwitterStrategy
    case 'google':
      return GoogleStrategy
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

function getSocialStrategyConfig(provider) {
  switch (provider) {
    case 'facebook':
      return {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        enableProof: true
      }
    case 'twitter':
      return {
        consumerKey: process.env.TWITTER_ID,
        consumerSecret: process.env.TWITTER_SECRET
      }
    case 'google':
      return {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET
      }
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

function getSocialProfileJSON(provider, profile) {
  switch (provider) {
    case 'facebook':
      return profile._raw
    default:
      return JSON.stringify(profile)
  }
}

function getNewUserDisplayName(provider, profile) {
  // Facebook
  if (profile._json.name) {
    return profile._json.name
  }

  // Fallback
  return `Nusa Fan #${Date.now()}`
}
