const Chihiro = require('@tkesgar/chihiro')
const {Router: router, json} = require('express')
const methods = require('../rpc')

const route = router()

route.use('/rpc', json())

route.post('/rpc/pub',
  dispatchMiddleware(methods.pub)
)

route.post('/rpc/usr',
  (req, res, next) => {
    const {user} = req

    if (!user) {
      req.app.log.debug('User is not logged in')
      return res.sendStatus(403)
    }

    return next()
  },
  dispatchMiddleware(methods.usr)
)

route.post('/rpc/stf',
  (req, res, next) => {
    const {user} = req

    if (!user) {
      req.app.log.debug('User is not logged in')
      return res.sendStatus(403)
    }

    if (!user.isStaff) {
      req.app.log.debug({user}, 'User is not staff')
      return res.sendStatus(403)
    }

    return next()
  },
  dispatchMiddleware(methods.stf)
)

route.post('/rpc/pic',
  (req, res, next) => {
    const {user} = req

    if (!user) {
      req.app.log.debug('User is not logged in')
      return res.sendStatus(403)
    }

    if (!user.isPIC) {
      req.app.log.debug({user}, 'User is not PIC')
      return res.sendStatus(403)
    }

    return next()
  },
  dispatchMiddleware(methods.pic)
)

module.exports = route

function dispatchMiddleware(methods) {
  const dispatcher = new Chihiro(methods)

  return (req, res, next) => {
    (async () => {
      const {body: request} = req
      const response = await dispatcher.dispatchRaw(request)

      req.app.log.debug({request, response}, 'JSON-RPC call successful')
      return res.json(response)
    })().catch(next)
  }
}
