'use strict';

var expect = require('expect.js');
var moment = require('moment');
var mongoskin = require('mongoskin');


describe('models/scci_feedback_model', function () {

    var model, db, collections;
    var currentTime = +moment().unix();
    var currentTimeInMs = currentTime * 1000;

    before(function (done) {
        model = require('../../../models/scci_feedback_model');
        db = mongoskin.db(process.env.FALCON_DB_URL);
        collections = [db.collection('events_scci'), db.collection('repo_conf'), db.collection('test_category')];
        done();
    });

    afterEach(function (done) {
        var drop = function (i) {
            if (i < collections.length)
                collections[i].drop(function (err) {
                    expect('' + err).to.match(/null|ns not found/);
                    drop(++i);
                });
            else
                done();
        };
        drop(0);
    });

    describe('getScResults', function () {

        it('existing bl is included in results', function (done) {
            var repoData = [{sc: 'ABC', bl: 'LTE-TDD'}, {sc: 'XYZ', bl: 'FZM'}];
            var data = [{
                time: currentTimeInMs - 1,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 4
            }, {
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 2,
                promotedtime: currentTime - 1
            }, {
                time: currentTimeInMs - 1,
                type: 'xyz',
                path: 'svn2',
                branch: 'trunk',
                date: currentTime - 7
            }, {
                time: currentTimeInMs,
                type: 'xyz',
                path: 'svn2',
                branch: 'trunk',
                date: currentTime - 5,
                promotedtime: currentTime - 3
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs
            };
            var expected = [{
                type: 'abc',
                bl: 'LTE-TDD',
                stats: {
                    feedbackTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    waitingTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    executionTime: {median: 0, min: 0, max: 0, mean: 0, stdev: 0}
                }
            }, {
                type: 'xyz',
                bl: 'FZM',
                stats: {
                    feedbackTime: {median: 2, min: 2, max: 2, mean: 2, stdev: 0},
                    waitingTime: {median: 2, min: 2, max: 2, mean: 2, stdev: 0},
                    executionTime: {median: 0, min: 0, max: 0, mean: 0, stdev: 0}
                }
            }];

            collections[0].insert(data, function () {
                collections[1].insert(repoData, function () {
                    assertSCResults(params, expected, done);
                });
            });
        });

        it('UNKNOWN bl is included in results', function (done) {
            var data = [{
                time: currentTimeInMs - 1,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 4
            }, {
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 2,
                promotedtime: currentTime - 1
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs
            };
            var expected = [{
                type: 'abc',
                bl: 'UNKNOWN',
                stats: {
                    feedbackTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    waitingTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    executionTime: {median: 0, min: 0, max: 0, mean: 0, stdev: 0}
                }
            }];

            collections[0].insert(data, function () {
                assertSCResults(params, expected, done);
            });
        });

        function assertSCResults(params, expected, done) {
            model.getScResults(params, function (e, results) {
                expect(e).to.eql(null);
                expect(results).to.eql(expected);
                done();
            });
        }

    });

    describe('getCategoryResults', function () {

        it('existing category is included in results', function (done) {
            var categoryData = [
                {test_name: 'ut', scci_category: 'ut_cat', sc: 'abc'},
                {test_name: 'sct', scci_category: 'sct_cat', sc: 'abc'},
                {test_name: 'ut', scci_category: 'different', sc: 'xyz'}
            ];
            var data = [{
                time: currentTimeInMs - 1,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 5,
                utstart: currentTime - 4,
                utend: currentTime - 3,
                utresult: 'PASS',
                sctstart: currentTime - 3,
                sctend: currentTime - 2,
                sctresult: 'PASS'
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs,
                sc: 'abc'
            };
            var expected = {
                UT_CAT: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                SCT_CAT: {median: 2, min: 2, max: 2, mean: 2, stdev: 0}
            };

            collections[0].insert(data, function () {
                collections[2].insert(categoryData, function () {
                    assertCategoryResults(params, expected, done);
                });
            });
        });

        it('UNKNOWN category is included in results', function (done) {
            var categoryData = [
                {test_name: 'ut', sc: 'abc'}
            ];
            var data = [{
                time: currentTimeInMs - 1,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 5,
                utstart: currentTime - 4,
                utend: currentTime - 2,
                utresult: 'PASS'
            }, {
                time: currentTimeInMs - 1,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 4,
                mtstart: currentTime - 2,
                mtend: currentTime - 1,
                mtresult: 'PASS'
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs,
                sc: 'abc'
            };
            var expected = {
                UNKNOWN: {median: 1.5, min: 1, max: 2, mean: 1.5, stdev: 0.5}
            };

            collections[0].insert(data, function () {
                collections[2].insert(categoryData, function () {
                    assertCategoryResults(params, expected, done);
                });
            });
        });

        function assertCategoryResults(params, expected, done) {
            model.getCategoryResults(params, function (e, results) {
                expect(e).to.eql(null);
                expect(results).to.eql(expected);
                done();
            });
        }

    });

});
