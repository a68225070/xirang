'use strict';

var sinon = require('sinon');
var expect = require('expect.js');

var es = {append: function() {}};

describe('api/scbuilds/', function() {
	var esMock;
	var res = {send: function (){}};
	var resMock;
	var next = sinon.spy();
	var sut = require('../../../controllers/scbuilds')(es);

	beforeEach(function(done) {
		esMock = sinon.mock(es);
		resMock = sinon.mock(res);

		done();
	});

	afterEach(function(done) {
		esMock.restore();
		resMock.restore();

		done();
	});

	it('do nothing on empty', function(done) {
		var req = {body: {}};

		resMock.expects('send').once().withArgs(400);

		sut.onSCCI(req, res, next);

		expect(next.callCount).to.eql(0);

		esMock.verify();
		resMock.verify();

		done();
	});

	it('store utend as time with ut post', function(done) {
		var beginTime = 1420682376000;
		var endTime = 1420682376004;
		var data = {revision: "1234567",commitrepo:"https://svne1.access.nsn.com/isource/svnroot/BTS_SC_DSP/branches", utstart: beginTime, utend: endTime};

		esMock.expects('append').once().on(es)
			.withArgs('scci/sc1', endTime, data)
			.yields(null);
		resMock.expects('send').once().withArgs(200);

		sut.onSCCI({sc: 'sc1', body: data}, res, next);

		expect(next.callCount).to.eql(0);

		esMock.verify();
		resMock.verify();

		done();
	});	
	
	it('Generic Test Data Interface could accept Jenkins job status values', function(done) {
		var beginTime = 1420682376000;
		var endTime = 1420682376004;
		var data = {revision: "1234567",commitrepo:"https://svne1.access.nsn.com/isource/svnroot/BTS_SC_DSP/branches", utstart: beginTime, utend: endTime, utresult: "SUCCESS"};

		esMock.expects('append').once().on(es)
			.withArgs('scci/sc1', endTime, data)
			.yields(null);

		resMock.expects('send').once().withArgs(200);

		sut.onSCCI({sc: 'sc1', body: data}, res, next);

		expect(next.callCount).to.eql(0);

		esMock.verify();
		resMock.verify();
		
		done();
	});

	it('store mtend as time with mt post', function(done) {
		var beginTime = 1420682376000;
		var endTime = 1420682376004;
		var data = {revision: "1234567",commitrepo:"https://svne1.access.nsn.com/isource/svnroot/BTS_SC_DSP/branches", mtstart: beginTime, mtend: endTime};

		esMock.expects('append').once().on(es)
			.withArgs('scci/sc1', endTime, data)
			.yields(null);
		resMock.expects('send').once().withArgs(200);

		sut.onSCCI({sc: 'sc1', body: data}, res, next);

		expect(next.callCount).to.eql(0);

		esMock.verify();
		resMock.verify();

		done();
	});

	it('store latest end as time', function(done) {
		var beginTime = 1420682376000;
		var endTime = 1420682376004;
		var data = {revision: "1234567",commitrepo:"https://svne1.access.nsn.com/isource/svnroot/BTS_SC_DSP/branches",
		    commits: [{revision: '111'}, {revision: '222'}],
			utstart: beginTime, utend: endTime+1,
			mtstart: beginTime, mtend: endTime-1,
			sctstart: beginTime, sctend: endTime+2,
			promotedtime: endTime+3};

		esMock.expects('append').once().on(es)
			.withArgs('scci/sc1', endTime+3, data)
			.yields(null);
		resMock.expects('send').once().withArgs(200);

		sut.onSCCI({sc: 'sc1', body: data}, res, next);

		expect(next.callCount).to.eql(0);

		esMock.verify();
		resMock.verify();

		done();
	});

	it('unify latest end time to ms', function(done) {
		var beginTime = 1420682376000;
		var endTime = 1420682376004;
		var data = {revision: "1234567",commitrepo:"https://svne1.access.nsn.com/isource/svnroot/BTS_SC_DSP/branches",
			utstart: beginTime, utend: endTime-8,
			mtstart: beginTime, mtend: endTime+1,
			sctstart: beginTime, sctend: endTime/1000 + 2,
			};

		esMock.expects('append').once().on(es)
			.withArgs('scci/sc1', Math.floor((endTime/1000+2)*1000), data)
			.yields(null);
		resMock.expects('send').once().withArgs(200);

		sut.onSCCI({sc: 'sc1', body: data}, res, next);

		expect(next.callCount).to.eql(0);

		esMock.verify();
		resMock.verify();

		done();
	});

	it('store nothing if no valid time', function(done) {
		var data = {revision: "1234567",commitrepo:"https://svne1.access.nsn.com/isource/svnroot/BTS_SC_DSP/branches", utstart:1234888, utend:123456789, result: 'PASS'};

		esMock.expects('append').never();
		resMock.expects('send').once().withArgs(200);

		sut.onSCCI({sc: 'sc1', body: data}, res, next);

		expect(next.callCount).to.eql(0);

		esMock.verify();
		resMock.verify();

		done();
	});

	it('pass through next if es.append failed', function() {
		var beginTime = 1420682376000;
		var endTime = 1420682376004;
		var data = {revision: "1234567",commitrepo:"https://svne1.access.nsn.com/isource/svnroot/BTS_SC_DSP/branches",
			sctstart: beginTime, sctend: endTime};

		var errMsg = 'test failure';
		esMock.expects('append').once().on(es)
			.withArgs('scci/sc1', endTime, data)
			.yields(new Error(errMsg));
		resMock.expects('send').never();

		sut.onSCCI({sc: 'sc1', body: data}, res, next);

		expect(next.callCount).to.eql(1);
		var errObj = next.args[0][0];
		expect(errObj).to.be.an(Object);
		expect(errObj.message).to.eql(errMsg);

		esMock.verify();
		resMock.verify();
	});
});

