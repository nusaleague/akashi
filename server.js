#!/usr/bin/env node
const app = require('./lib/app')

const port = process.env.PORT
app.listen(port, () => app.log.info(`Server listening on port ${port}`))
