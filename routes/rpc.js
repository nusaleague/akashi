const {Router: router, json} = require('express');
const {serviceManager} = require('../lib/service');

module.exports = () => {
	const rpc = serviceManager.get('rpc');

	const route = router();

	route.post('/rpc',
		(req, res, next) => json()(req, res, err => {
			if (err) {
				next(Object.assign(err, {__isFromJSONRPC: true}));
				return;
			}

			next();
		}),
		(req, res, next) => {
			(async () => {
				const {body: request, user} = req;

				const response = await rpc(request, user);

				if (response === null) {
					res.sendStatus(204);
					return;
				}

				res.json(response);
			})().catch(next);
		}
	);

	return route;
};
