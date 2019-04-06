const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const redis = require('redis')

const client = redis.createClient(process.env.REDIS_URL)

function createRateLimit(prefix, max) {
  return rateLimit({
    store: new RedisStore({client, prefix}),
    windowMs: 1 * 60 * 1000,
    max
  })
}

module.exports = createRateLimit
