#!/usr/bin/env node
const express = require('express');
const requireAll = require('./lib/require-all');
const {env} = require('./lib/env');
const {serviceManager, loadAll} = require('./lib/service');

async function main() {
	const ctx = {
		env
	};

	Object.assign(serviceManager.ctx, ctx);

	loadAll('./services/*.js');
	loadAll('./models/*.js', undefined, {prefix: 'models/'});

	const app = express();

	requireAll('./mods/*.js').forEach(mod => mod({
		...ctx,
		app
	}));

	const log = serviceManager.get('log');
	app.listen(env.PORT, () => log.info(`Server listening on port ${env.PORT}`));
}

main().catch(error => {
	const log = serviceManager.get('log');

	log.fatal({err: error});
	process.exitCode = 1;
});
