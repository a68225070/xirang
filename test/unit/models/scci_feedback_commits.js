'use strict';

var expect = require('expect.js');
var moment = require('moment');
var mongoskin = require('mongoskin');


describe('models/scci_feedback_commits', function () {

    var model, db, collection;
    var currentTime = +moment().unix();
    var currentTimeInMs = currentTime * 1000;

    before(function (done) {
        model = require('../../../models/scci_feedback_commits');
        db = mongoskin.db(process.env.FALCON_DB_URL);
        collection = db.collection('events_scci');
        done();
    });

    afterEach(function (done) {
        collection.drop(function (err) {
            expect('' + err).to.match(/null|ns not found/);
            done();
        });
    });

    describe('fetchCommits', function () {

        it('gets empty commits on empty data', function (done) {
            var params = {
                begin: 1,
                end: 2
            };
            var expected = [];

            assertFetchedCommits(params, expected, done);
        });

        it('gets commits filtered by sc', function (done) {
            var data = [{
                time: 1000,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: 1
            }, {
                time: +currentTime - 1,
                type: 'def',
                path: 'svn2',
                branch: 'trunk',
                date: currentTime - 3
            }, {
                time: currentTimeInMs,
                type: 'def',
                path: 'svn2',
                branch: 'trunk',
                date: currentTime - 2,
                promotedtime: currentTime - 1
            }, {
                time: currentTimeInMs,
                type: 'xyz',
                path: 'svn3',
                branch: 'trunk',
                date: currentTime - 2,
                promotedtime: currentTime - 1
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs,
                sc: 'def'
            };
            var expected = [data[1], data[2]];

            collection.insert(data, function () {
                assertFetchedCommits(params, expected, done);
            });
        });

        it('gets commits filtered by branch', function (done) {
            var data = [{
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 4
            }, {
                time: currentTimeInMs - 1,
                type: 'abc',
                path: 'svn2',
                branch: 'br1',
                date: currentTime - 3
            }, {
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn2',
                branch: 'br1',
                date: currentTime - 2,
                promotedtime: currentTime - 1
            }, {
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn3',
                branch: 'br2',
                date: currentTime - 2,
                promotedtime: currentTime - 1
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs,
                branch: 'br1'
            };
            var expected = [data[1], data[2]];

            collection.insert(data, function () {
                assertFetchedCommits(params, expected, done);
            });
        });

        it('gets commits filtered by branch pattern', function (done) {
            var data = [{
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 4
            }, {
                time: currentTimeInMs - 1,
                type: 'abc',
                path: 'svn2',
                branch: 'br10',
                date: currentTime - 3
            }, {
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn3',
                branch: 'br15',
                date: currentTime - 2,
                promotedtime: currentTime - 1
            }, {
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn4',
                branch: 'br20',
                date: currentTime - 2,
                promotedtime: currentTime - 1
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs,
                branchRegex: 'br1.*'
            };
            var expected = [data[1], data[2]];

            collection.insert(data, function () {
                assertFetchedCommits(params, expected, done);
            });
        });

        it('gets commits filtered by date range', function (done) {
            var data = [{
                time: currentTimeInMs,
                type: 'efg',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 10
            }, {
                time: currentTimeInMs,
                type: 'efg',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 9
            }, {
                time: currentTimeInMs,
                type: 'efg',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 8,
                promotedtime: currentTime - 7
            }, {
                time: currentTimeInMs,
                type: 'efg',
                path: 'svn1',
                branch: 'trunk',
                date: currentTime - 7
            }];
            var params = {
                begin: currentTimeInMs - 9000,
                end: currentTimeInMs - 8000
            };
            var expected = [data[1], data[2]];

            collection.insert(data, function () {
                assertFetchedCommits(params, expected, done);
            });
        });

        function assertFetchedCommits(params, expected, done) {
            model.fetchCommits(params, function (e, commits) {
                expect(e).to.eql(null);
                expect(commits).to.eql(expected);
                done();
            });
        }

    });

    describe('fetchScciFeedbackCommits', function () {

        it('commits are grouped by repository branch', function (done) {
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
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn2',
                branch: 'br1',
                date: currentTime
            }, {
                time: currentTimeInMs - 1,
                type: 'xyz',
                path: 'svn3',
                branch: 'trunk',
                date: currentTime - 5
            }, {
                time: currentTimeInMs,
                type: 'xyz',
                path: 'svn3',
                branch: 'trunk',
                date: currentTime - 4,
                promotedtime: currentTime - 3
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs,
                cumulative: true
            };
            var expected = {
                abc: {
                    trunk: [data[0], data[1]],
                    br1: [data[2]]
                },
                xyz: {
                    trunk: [data[3], data[4]]
                }
            };

            collection.insert(data, function () {
                assertFetchedCommits(params, expected, done);
            });
        });

        it('commits without promotion data are not fetched in non cumulative mode', function (done) {
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
                time: currentTimeInMs,
                type: 'abc',
                path: 'svn2',
                branch: 'br1',
                date: currentTime
            }, {
                time: currentTimeInMs - 1,
                type: 'xyz',
                path: 'svn3',
                branch: 'trunk',
                date: currentTime - 5
            }, {
                time: currentTimeInMs,
                type: 'xyz',
                path: 'svn3',
                branch: 'trunk',
                date: currentTime - 4,
                promotedtime: currentTime - 3
            }];
            var params = {
                begin: 0,
                end: currentTimeInMs,
                cumulative: false
            };
            var expected = {
                abc: {
                    trunk: [data[1]]
                },
                xyz: {
                    trunk: [data[4]]
                }
            };

            collection.insert(data, function () {
                assertFetchedCommits(params, expected, done);
            });
        });

        function assertFetchedCommits(params, expected, done) {
            model.fetchScciFeedbackCommits(params, function (e, commits) {
                expect(e).to.eql(null);
                expect(commits).to.eql(expected);
                done();
            });
        }

    });

});
