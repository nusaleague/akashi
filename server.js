require('./utils/env').loadEnv();

const createApp = require('./utils/app');
const log = require('./utils/log');

const port = process.env.PORT;

createApp().listen(port, () => {
  log.info(`Server listening at port ${port}`);
});
