/* istanbul ignore file */
const express = require('express');
const Hapi = require('@hapi/hapi');
const Hecks = require('hecks');

async function createServer(middleware, opts = {}) {
  const { beforeSetup = null, afterSetup = null } = opts;

  const app = express();

  if (typeof beforeSetup === 'function') {
    beforeSetup(app);
  }

  app.use(middleware);

  if (typeof afterSetup === 'function') {
    afterSetup(app);
  }

  const server = Hapi.server();
  await server.register([Hecks.toPlugin(app, 'app')]);

  return server;
}

exports.createServer = createServer;

async function createResponse(
  middleware,
  request = {
    method: 'get',
    url: '/'
  }
) {
  const server = await createServer(middleware);
  return server.inject(request);
}

exports.createResponse = createResponse;
