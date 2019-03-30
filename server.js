#!/usr/bin/env node

// eslint-disable-next-line import/no-unassigned-import
require('./lib/env')

const app = require('./lib/app')
const {PORT} = require('./lib/env')

app.listen(PORT, () => app.log.info(`Server listening on port ${PORT}`))
