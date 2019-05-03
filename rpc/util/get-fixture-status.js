const moment = require('moment');

function getFixtureStatus(voteFixture) {
	const {
		override_open: override,
		start_time: start,
		end_time: end
	} = voteFixture;

	if (override) {
		return true;
	}

	if (start !== null) {
		if (moment().isBefore(start)) {
			return null;
		}
	}

	if (end !== null) {
		if (moment().isAfter(end)) {
			return false;
		}
	}

	return false;
}

module.exports = getFixtureStatus;
