#!/usr/bin/env node
const app = require('./lib/app')
const logger = require('./lib/log')

const port = process.env.PORT
app.listen(port, () => logger.info(`Server listening on port ${port}`))
