#!/usr/bin/env node

// eslint-disable-next-line import/no-unassigned-import
require('./lib/env')

const app = require('./lib/app')

const {PORT: port} = process.env
app.listen(port, () => app.log.info(`Server listening on port ${port}`))
