'use strict';

var expect = require('expect.js');
var utils = require('../../utils');


describe('utils.toTimeOffset', function() {
	it('keep same with offset values', function() {
		expect(utils.toOffsetTime(1425635519000)).to.eql(1425635519000);
		expect(utils.toOffsetTime(1425635519013)).to.eql(1425635519013);
	});

	it('convert Unix time to offset time', function() {
		expect(utils.toOffsetTime(1425635519)).to.eql(1425635519000);
		expect(utils.toOffsetTime(1425635510)).to.eql(1425635510000);
	});

	it('values < 2000/01/01 00:00:00', function() {
		expect(utils.toOffsetTime(946656000)).to.eql(0);
	});
});

describe('utils.toUnixTime', function() {
	it('keep same with Unix values', function() {
		expect(utils.toUnixTime(1425635519)).to.eql(1425635519);
	});

	it('convert offset time to Unix time', function() {
		expect(utils.toUnixTime(1425635519000)).to.eql(1425635519);
		expect(utils.toUnixTime(1425635519013)).to.eql(1425635519);
	});

	it('values < 2000/01/01 00:00:00', function() {
		expect(utils.toUnixTime(946656000)).to.eql(0);
	});
});