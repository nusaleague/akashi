const {Router: router} = require('express')

const route = router()

route.get('/ping', (req, res) => res.send('pong'))

module.exports = route
