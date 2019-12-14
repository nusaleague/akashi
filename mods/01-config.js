module.exports = ({ app, env }) => {
  const nodeEnv = env.NODE_ENV;
  const trustProxy = JSON.parse(env.TRUST_PROXY);

  app.set('view engine', 'ejs');
  app.set('env', nodeEnv);
  app.set('trust proxy', JSON.parse(trustProxy));
};
