const path = require('path')
const {Router: router, json} = require('express')
const {createServer} = require('@tkesgar/chihiro')
const {sync: glob} = require('glob')
const {dev} = require('../lib/env')

const methodDictionary = glob(path.resolve('./rpc/*.js'))
  .map(path => require(path))
  .reduce((dictionary, entries) => Object.assign(dictionary, entries), {})

const route = router()

route.post('/rpc',
  json(),
  (req, res, next) => {
    (async () => {
      const ctx = {
        user: req.user || null
      }

      const server = createServer(createHandler(ctx))

      const request = req.body
      const response = await server.dispatchRequest(request)
      req.app.log.debug({ctx, request, response}, 'JSON-RPC call')

      if (response === null) {
        res.sendStatus(204)
        return
      }

      if (response.result || Array.isArray(response)) {
        res.json(response)
        return
      }

      if (response.error) {
        res.status(getStatusFromCode(response.error.code)).json(response)
        return
      }

      res.sendStatus(500)
    })().catch(next)
  }
)

module.exports = route

function createHandler(ctx) {
  return async (methodName, args) => {
    const method = methodDictionary[methodName]
    if (!method) {
      throw Object.assign(new Error('Method not found'), {code: -32601})
    }

    if (method.auth) {
      const {user} = ctx
      if (!user) {
        throw Object.assign(new Error('Authentication required'), {code: -32001})
      }

      if (!method.auth(user)) {
        throw Object.assign(new Error('Not authorized'), {code: -32003})
      }
    }

    const passContext = method.context || methodName.startsWith('ctx_')

    try {
      const result = await method.call(
        passContext ? {ctx} : null,
        ...(Array.isArray(args) ? args : [args])
      )
      return result
    } catch (error) {
      throw Object.assign(new Error('Method error'), {
        code: -32000,
        ...(dev ? {data: error} : {})
      })
    }
  }
}

function getStatusFromCode(code) {
  switch (code) {
    case -32700: return 400
    case -32600: return 400
    case -32601: return 404
    case -32602: return 400
    case -32603: return 500
    case -32000: return 500
    case -32001: return 401
    case -32003: return 403
    default: return 500
  }
}
