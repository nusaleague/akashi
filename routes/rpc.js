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
    const {user} = req

    if (!user) {
      req.app.log.debug('User is not logged in')
      return res.sendStatus(403)
    }

    return next()
  },
  createDispatcher('user')
)

route.post('/rpc/staff',
  (req, res, next) => {
    const {user} = req

    if (!user) {
      req.app.log.debug('User is not logged in')
      return res.sendStatus(403)
    }

    if (!user.isStaff) {
      req.app.log.debug({user}, 'User is not a staff')
      return res.sendStatus(403)
    }

    return next()
  },
  createDispatcher('staff')
)

route.post('/rpc/pic',
  (req, res, next) => {
    const {user} = req

    if (!user) {
      req.app.log.debug('User is not logged in')
      return res.sendStatus(403)
    }

    if (!user.isPIC) {
      req.app.log.debug({user}, 'User is not a PIC')
      return res.sendStatus(403)
    }

    return next()
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
      const request = req.body
      const response = await dispatcher.dispatchRaw(request)

      req.app.log.debug({request, response}, 'JSON-RPC call successful')
      return res.json(response)
    })().catch(next)
  }
}
