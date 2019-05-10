const {Router: router} = require('express');
const {serviceManager} = require('../lib/service');

module.exports = ({env: {authRedirect}}) => {
	const passport = serviceManager.get('passport');
	const log = serviceManager.get('log');

	const route = router();

	route.get('/auth/google',
		(req, res, next) => {
			req.session.next = req.query.next;
			next();
		},
		passport.authenticate('google')
	);

	route.get('/auth/google/callback',
		(req, res, next) => {
			log.debug({req}, 'Google auth callback');
			next();
		},
		passport.authenticate('google'),
		(req, res) => {
			const url = authRedirect[req.session.next];
			delete req.session.next;

			if (url) {
				res.redirect(url);
				return;
			}

			res.render('auth-callback');
		}
	);

	return route;
};
