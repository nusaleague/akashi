const { Router: router } = require('express');
const handle = require('../utils/middlewares/handle');

const route = router();

route.get(
  '/ping',
  handle(() => {})
);

module.exports = route;
