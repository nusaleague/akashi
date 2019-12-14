const cors = require('cors');

module.exports = ({ app, env: { dev } }) => {
  app.use(
    cors({
      origin: dev ? true : /nusaleague\.com$/,
      credentials: true
    })
  );
};
