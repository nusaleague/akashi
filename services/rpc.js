const {createServer} = require('@tkesgar/chihiro');
const requireAll = require('../lib/require-all');
const err = require('../lib/error');
const {serviceManager} = require('../lib/service');

function dispatch(methods, request, user) {
	const log = serviceManager.get('log');

	const server = createServer(async (methodName, params) => {
		const methodInfo = methods[methodName];
		if (!methodInfo) {
			throw new err.MethodNotFoundError();
		}

		const {mapParams, validateArgs, auth, fn} = methodInfo;

		const args = (() => {
			if (typeof params === 'undefined') {
				return [];
			}

			if (Array.isArray(params)) {
				return params;
			}

			if (!mapParams) {
				throw new err.InvalidParamsError();
			}

			return mapParams(params);
		})();

		if (validateArgs) {
			try {
				await validateArgs(...args);
			} catch {
				throw new err.InvalidParamsError();
			}
		}

		if (auth) {
			if (!user) {
				throw new err.AuthRequiredError();
			}

			if (!(await auth(user, ...args))) {
				throw new err.UnauthorizedError();
			}
		}

		try {
			const result = await fn(...args);
			return result;
		} catch (error) {
			if (typeof error.message === 'string' && typeof error.code === 'number') {
				throw error;
			}

			log.error({err: error}, 'Function call returned a non-standard error');
			throw new err.InternalMethodError();
		}
	});

	return server.dispatchRequest(request);
}

module.exports = {
	name: 'rpc',
	init() {
		const methods = {};
		requireAll('./rpc/*.js').forEach(method => {
			if (methods[method.name]) {
				throw new Error(`Duplicate JSON-RPC method: ${method.name}`);
			}

			methods[method.name] = method;
		});

		return (request, user) => dispatch(methods, request, user);
	}
};
