const requireAll = require('./require-all');

class ServiceManager {
	constructor(ctx = {}) {
		this.ctx = ctx;
		this._init = {};
		this._ready = {};
	}

	register(name, init) {
		if (this._init[name]) {
			throw new Error(`Duplicate service name: ${name}`);
		}

		this._init[name] = init;
	}

	is(name) {
		return Boolean(this._init[name]);
	}

	ready(name) {
		if (!this.is(name)) {
			throw new Error(`Service not available: ${name}`);
		}

		return Boolean(this._ready[name]);
	}

	get(name) {
		if (!this.ready(name)) {
			this._ready[name] = this._init[name](this.ctx);
		}

		return this._ready[name];
	}
}

exports.ServiceManager = ServiceManager;

const defaultInstance = new ServiceManager();

exports.serviceManager = defaultInstance;

function loadAll(path, serviceManager = defaultInstance, opts = {}) {
	const {
		prefix = ''
	} = opts;

	requireAll(path).forEach(loaded => {
		(Array.isArray(loaded) ? loaded : [loaded]).forEach(service => {
			const {name, init} = service;
			serviceManager.register(prefix + name, init);
		});
	});
}

exports.loadAll = loadAll;
