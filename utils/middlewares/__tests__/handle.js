const handle = require('../handle');
const {
  createServer,
  createResponse
} = require('../../test-helpers/middleware');

it('should send success response if fn is success', async () => {
  const data = { foo: 'bar', baz: null };
  const response = await createResponse(handle(() => data));

  expect(JSON.parse(response.payload)).toEqual({ status: 'success', data });
});

it('should call next if middleware is true', async () => {
  const nextHandler = jest.fn((req, res) => res.sendStatus(200));
  const response = await createResponse([
    handle(() => {}, { middleware: true }),
    nextHandler
  ]);

  expect(nextHandler).toBeCalled();
  expect(response.statusCode).toBe(200);
});

it('should send fail if fn throws error with { status: fail, statusCode: 451 }', async () => {
  const status = 'fail';
  const statusCode = 451;
  const code = 'F_LEGAL';
  const message = 'Unavailable for legal reasons';
  const response = await createResponse(
    handle(() => {
      throw Object.assign(new Error(message), {
        status,
        statusCode,
        code
      });
    })
  );

  expect(response.statusCode).toBe(statusCode);
  expect(JSON.parse(response.payload)).toEqual({ status, code, message });
});

it('should send fail 400 if fn throws error with { status: fail }', async () => {
  const status = 'fail';
  const code = 'F_ILLEGAL_STATE';
  const message = 'Cannot perform delete on this resource';
  const response = await createResponse(
    handle(() => {
      throw Object.assign(new Error(message), {
        status,
        code
      });
    })
  );

  expect(response.statusCode).toBe(400);
  expect(JSON.parse(response.payload)).toEqual({ status, code, message });
});

it('should send fail 500 if fn throws error with { status: error }', async () => {
  const status = 'error';
  const code = 'E_UPSTREAM_NOT_AVAILABLE';
  const message = 'Upstream server is currently not available';
  const response = await createResponse(
    handle(() => {
      throw Object.assign(new Error(message), {
        status,
        code
      });
    })
  );

  expect(response.statusCode).toBe(500);
  expect(JSON.parse(response.payload)).toEqual({ status, code, message });
});

it('should call app error handler if fn throws error with unknown status', async () => {
  const statusCode = 500;
  const message = 'Oh noes';
  const errorHandler = jest.fn((err, req, res, next) => {
    if (typeof err.statusCode !== 'number') {
      next(err);
      return;
    }

    res.status(err.statusCode).send(err.message);
  });

  const server = await createServer(
    handle(() => {
      throw Object.assign(new Error(message), { statusCode });
    }),
    {
      afterSetup(app) {
        app.use(errorHandler);
      }
    }
  );

  const response = await server.inject({ method: 'get', url: '/' });

  expect(errorHandler).toBeCalled();
  expect(response.statusCode).toBe(statusCode);
  expect(response.payload).toEqual(message);
});
