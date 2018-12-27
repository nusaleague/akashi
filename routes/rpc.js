const path = require('path')
const Chihiro = require('@tkesgar/chihiro')
const {Router: router, json} = require('express')
const {sync: glob} = require('glob')

const route = router()

route.use('/rpc', json())

route.post('/rpc/public',
  createDispatcher('public')
)

route.post('/rpc/user',
  (req, res, next) => {
    if (req.user) {
      return next()
    }
    return res.sendStatus(403)
  },
  createDispatcher('user')
)

route.post('/rpc/staff',
  (req, res, next) => {
    if (req.user && req.user.isStaff) {
      return next()
    }
    return res.sendStatus(403)
  },
  createDispatcher('staff')
)

route.post('/rpc/pic',
  (req, res, next) => {
    if (req.user && req.user.isPIC) {
      return next()
    }
    return res.sendStatus(403)
  },
  createDispatcher('pic')
)

module.exports = route

function createDispatcher(type) {
  const dispatcher = new Chihiro(
    glob(path.resolve(`rpc/${type}/*.js`))
      .reduce((methods, path) => Object.assign(methods, require(path)), {})
  )

  return (req, res, next) => {
    (async () => {
      return res.json(await dispatcher.dispatchRaw(req.body))
    })().catch(next)
  }
}
