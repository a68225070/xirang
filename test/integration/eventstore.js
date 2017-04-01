'use strict';

var expect = require('expect.js');
var mongoskin = require('mongoskin');
var async = require('async');

describe('model::EventStore', function() {
	var db, events, url;
	var testsc = 'WarpCore';
	var testscLowercase = 'warpcore';
	var testType = 'scci/' + testscLowercase;
	var es;

	before(function(done) {
		es = require('../../eventstore')();
		db = mongoskin.db(process.env.FALCON_DB_URL);
		events = db.collection('events');
		events.drop(function(err) {
			expect(''+err).to.match(/null|ns not found/);
			done();
		});
	});

	afterEach(function(done) {
        db.collection('events').drop(function(err) {
            expect(''+err).to.match(/null|ns not found/);
            done();
        });

/*		db.dropDatabase(function(err) {
			expect(''+err).to.match(/null|ns not found/);
			done();
		});*/
	});

	function appendAndVerify(evt, expected, next) {
		es.append(evt.type, evt.time, evt.data, function(e) {
			events.find({}, {'_id':0}).toArray(function(e, res) {
				expect(e).to.eql(null);
				expect(res.length).to.eql(1);
				expect(res[0].type).to.eql(expected.type);
				expect(res[0].time).to.eql(expected.time);
				expect(res[0].data).to.eql(expected.data);
				next();
			});
		});
	}

	it('append successfully', function(done) {
		var dateInMS = 1420682376000;
		var evt = {type:testType, time: dateInMS, data:{}};
		var expected = {type:testType, time: dateInMS, data:{}};

		appendAndVerify(evt, expected, done);
	});

	it('convert UNIX timestamp to ms', function(done) {
		var dateInUnixtime = 1420682376;
		var evt = {type:testType, time: dateInUnixtime, data:{}};
		var expected = {type:testType, time: Math.floor(dateInUnixtime*1000), data:{}};

		appendAndVerify(evt, expected, done);
	});

	it('filter-out duplications with deep comparison', function(done) {
		var dateInMS = 1420682376000;
		var evt = {type:testType, time: dateInMS, data:{sc:'a', revision:'2', author:'simshi'}};
		var expected = {type:testType, time: dateInMS, data:{sc:'a', author:'simshi', revision:'2'}};

		async.series([
			es.append.bind(es, evt.type, evt.time, {sc:'b', revision:'2', author:'simshi'}),
			es.append.bind(es, evt.type, evt.time, evt.data),
			es.append.bind(es, evt.type, evt.time, expected.data),
			function(cb) {
				events.find({type:evt.type, time:evt.time, 'data.sc':evt.data.sc}, {'_id':0}).toArray(function(e, res) {
					expect(e).to.eql(null);
					expect(res.length).to.eql(1);
					expect(res[0].type).to.eql(expected.type);
					expect(res[0].time).to.eql(expected.time);
					expect(res[0].data).to.eql(expected.data);

					cb();
				});
			}], function(e) {
				expect(e).to.eql(undefined);
				done();
		});
	});

	it('filter-out duplications in any order', function(done) {
		var dateInMS = 1420682376000;
		var evt = {type:testType, time: dateInMS, data:{sc:'a', revision:'2', author:'simshi'}};
		var expected = {type:testType, time: dateInMS, data:{sc:'a', author:'simshi', revision:'2'}};

		async.series([
			es.append.bind(es, evt.type, evt.time, evt.data),
			es.append.bind(es, evt.type, evt.time, {sc:'b', revision:'2', author:'simshi'}),
			es.append.bind(es, evt.type, evt.time, expected.data),
			function(cb) {
				events.find({type:evt.type, time:evt.time, 'data.sc':evt.data.sc}, {'_id':0}).toArray(function(e, res) {
					expect(e).to.eql(null);
					expect(res.length).to.eql(1);
					expect(res[0].type).to.eql(expected.type);
					expect(res[0].time).to.eql(expected.time);
					expect(res[0].data).to.eql(expected.data);

					cb();
				});
			}], function(e) {
				expect(e).to.eql(undefined);
				done();
		});
	});

	it('duplication checking after time uniform', function(done) {
		var dateInUnixtime = 1420682376;
		var evt = {type:testType, time: dateInUnixtime, data:{sc:'a', revision:'2', author:'simshi'}};
		var expected = {type:testType, time: Math.floor(dateInUnixtime*1000), data:{sc:'a', author:'simshi', revision:'2'}};

		appendAndVerify(evt, expected, function() {
                evt = {type:testType, time: dateInUnixtime, data:{sc:'a', revision:'2', author:'simshi'}};
				appendAndVerify(evt, expected, done);
			});
	});
});

