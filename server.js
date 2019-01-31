#!/usr/bin/env node
const createApp = require('./lib/app')

const app = createApp()

const {PORT: port} = process.env
app.listen(port, () => app.log.info(`Server listening on port ${port}`))
