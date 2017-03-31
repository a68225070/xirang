'use strict';

var expect = require('expect.js');
var moment = require('moment');
var mongoskin = require('mongoskin');


describe('models/commit_metrics', function () {

    var commit_metrics, db, collection;
    var currentTime = +moment().unix();
    var currentTimeInMs = currentTime * 1000;

    before(function (done) {
        commit_metrics = require('../../../models/commit_metrics_model');
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

    it('gets empty commits on empty data', function (done) {
        var filters = {
            begin: 1,
            end: 2
        };
        var expected = [];

        assertFetchedCommits(filters, expected, done);
    });

    it('gets commits filtered by sc', function (done) {
        var data = [{
            time: currentTimeInMs,
            type: 'abc',
            path: 'svn1',
            branch: 'trunk',
            date: currentTime - 4,
            revision: '1',
			bl:'ABC'
        }, {
            time: currentTimeInMs - 1,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: currentTime - 3,
            revision: '2',
			bl:'TRS'
        }, {
            time: currentTimeInMs,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: currentTime - 2,
            revision: '3',
			bl:'TRS'
        }, {
            time: currentTimeInMs,
            type: 'xyz',
            path: 'svn3',
            branch: 'trunk',
            date: currentTime - 2,
            revision: '4',
			b:'XYZ'
        }];
        var filters = {
            begin: 0,
            end: currentTimeInMs,
            sc: 'trs'
        };
        var expected = [{
            time: data[1].time,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: data[1].date,
            revision: '2',
			bl:'TRS'
        }, {
            time: data[2].time,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: data[2].date,
            revision: '3',
			bl:'TRS'
        }];

        collection.insert(data, function () {
            assertFetchedCommits(filters, expected, done);
        });
    });

    it('gets commits filtered by date range ', function (done) {
        var data = [{
            time: currentTimeInMs,
            type: 'abc',
            path: 'svn1',
            branch: 'trunk',
            date: currentTime,
            revision: '1',
			bl:'ABC'
        }, {
            time: currentTimeInMs - 1,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: currentTime - 1,
            revision: '2',
			bl:'SM'
        }, {
            time: currentTimeInMs - 2,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: currentTime - 2,
            revision: '3',
			bl:'SM'
        }, {
            time: currentTimeInMs - 3,
            type: 'xyz',
            path: 'svn3',
            branch: 'trunk',
            date: currentTime - 3,
            revision: '4',
			bl:'XYZ'
        }];
        var filters = {
            begin: currentTimeInMs - 1,
            end: currentTimeInMs
        };
        var expected = [{
            "time": currentTimeInMs,
            "type": "abc",
            "path": "svn1",
            "branch": "trunk",
            "date": currentTime,
            "revision": "1",
			"bl":'ABC'
        }, {
            "time": currentTimeInMs - 1,
            "type": "trs",
            "path": "svn2",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "2",
			"bl":"SM"
        }];

        collection.insert(data, function () {
            assertFetchedCommits(filters, expected, done);
        });
    });

    it('aggregate commits aggregation date', function (done) {
        var data = [{
            "time": currentTimeInMs,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime,
            "revision": "1",
            "loc": 10,
			"bl":"SM"

        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "2",
            "loc": 20,
			"bl":"SM"
        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "3",
			"bl":"SM"
        }];
        var filters = {
            begin: currentTimeInMs - 1,
            end: currentTimeInMs
        };
        var expected = {
            "NA":{
				"trs": {
					"trunk": [{
						"date": moment(currentTimeInMs).format('YYYY-MM-DD'),
						"count": 3,
						"loc": 30,
                        "revisiondata": [
                  {
                    "bl": "NA",
                    "branch": "trunk",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "date": currentTimeInMs,
                    "loc": 10,
                    "revision": "1",
                    "type": "trs"
                  },
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs -1,
                    "loc": 20,
                    "revision": "2",
                    "type": "trs"
                  },
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs -1,
                    "loc": 0,
                    "revision": "3",
                    "type": "trs"
                  }
                ]

					}]
				}
			}
        };

        assertAggregateCommits(filters, data, 'day', expected, done);
    });

    it('aggregate commits aggregation week', function (done) {
        var data = [{
            "time": currentTimeInMs,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime,
            "revision": "1",
            "loc": 10,
			"bl":"SM"
        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "2",
            "loc": 20,
			"bl":"SM"
        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "3",
			"bl":"SM"
        }];
        var filters = {
            begin: currentTimeInMs - 1,
            end: currentTimeInMs
        };
        var expected = {
			"NA":{	
				"trs": {
					"trunk": [{
						"date": moment(currentTimeInMs).format('YYYY-WW'),
						"count": 3,
						"loc": 30,
                    "revisiondata": [
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs,
                    "loc": 10,
                    "revision": "1",
                    "type": "trs"
                  },
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs -1,
                    "loc": 20,
                    "revision": "2",
                    "type": "trs"
                  },
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs -1,
                    "loc": 0,
                    "revision": "3",
                    "type": "trs"
                  }
                ]
					}]
				}
			}
        };

        assertAggregateCommits(filters, data, 'week', expected, done);
    });

    it('aggregate commits aggregation month', function (done) {
        var data = [{
            "time": currentTimeInMs,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime,
            "revision": "1",
            "loc": 10,
			"bl":"SM"
        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "2",
            "loc": 20,
			"bl":"SM"
        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "3",
			"bl":"SM"
        }];
        var filters = {
            begin: currentTimeInMs - 1,
            end: currentTimeInMs
        };
        var expected = {
			"NA":{	
				"trs": {
					"trunk": [{
						"date": moment(currentTimeInMs).format('YYYY-MM'),
						"count": 3,
						"loc": 30,
                    "revisiondata": [
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs,
                    "loc": 10,
                    "revision": "1",
                    "type": "trs"
                  },
                  {
                    "bl": "NA",
                    "branch": "trunk",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "date": currentTimeInMs -1,
                    "loc": 20,
                    "revision": "2",
                    "type": "trs"
                  },
                  {
                    "bl": "NA",
                    "branch": "trunk",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "date": currentTimeInMs -1,
                    "loc": 0,
                    "revision": "3",
                    "type": "trs"
                  }
                ]
					}]
				}
			}
        };

        assertAggregateCommits(filters, data, 'month', expected, done);
    });

    it('aggregate commits aggregation day, based on sc', function (done) {
        var data = [{
            "time": currentTimeInMs,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime,
            "revision": "1",
            "loc": 10,
			"bl":"SM"

        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "ps",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "2",
            "loc": 20,
			"bl":"SM"
        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "3",
			"bl":"SM"
        }];
        var filters = {
            begin: currentTimeInMs - 1,
            end: currentTimeInMs
        };
        var expected = {
		"NA":{
            "ps": {
                "trunk": [{
                    "count": 1,
                    "date": moment(currentTimeInMs).format('YYYY-MM-DD'),
                    "loc": 20,
                "revisiondata": [
                  {
                    "bl": "NA",
                    "author":"baby",
                    "sc":"trs",
                    "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs - 1,
                    "loc": 20,
                    "revision": "2",
                    "type": "ps"
                  }
                ]

                }]
            },
            "trs": {
                "trunk": [{
                    "count": 2,
                    "date": moment(currentTimeInMs).format('YYYY-MM-DD'),
                    "loc": 10,
                    "revisiondata": [
                  {
                    "bl": "NA",
                    "author":"baby",
                    "sc":"trs",
                    "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs,
                    "loc": 10,
                    "revision": "1",
                    "type": "trs"
                  },
                  {
                    "bl": "NA",
                    "author":"baby",
                    "sc":"trs",
                    "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs - 1,
                    "loc": 0,
                    "revision": "3",
                    "type": "trs"
                  }
                ]
                }]
            }
		}	
        };

        assertAggregateCommits(filters, data, 'day', expected, done);
    });

    it('aggregate commits aggregation day, based on sc and branch', function (done) {
        var data = [{
            "time": currentTimeInMs,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime,
            "revision": "1",
            "loc": 10,
			"bl":"SM"
        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "trunk",
            "date": currentTime - 1,
            "revision": "2",
            "loc": 20,
			"bl":"SM"
        }, {
            "time": currentTimeInMs - 1,
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
            "type": "trs",
            "branch": "CPI",
            "date": currentTime - 1,
            "revision": "3",
            "loc": 22,
			"bl":"SM"
        }];
        var filters = {
            begin: currentTimeInMs - 1,
            end: currentTimeInMs
        };
        var expected = {
			"NA":{
				"trs": {
					"trunk": [{
						"count": 2,
						"date": moment(currentTimeInMs).format('YYYY-MM-DD'),
						"loc": 30,
                    "revisiondata": [
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs,
                    "loc": 10,
                    "revision": "1",
                    "type": "trs"
                  },
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "trunk",
                    "date": currentTimeInMs - 1,
                    "loc": 20,
                    "revision": "2",
                    "type": "trs"
                  }
                ]

					}],
					"CPI": [{
						"count": 1,
						"date": moment(currentTimeInMs).format('YYYY-MM-DD'),
						"loc": 22,
                    "revisiondata": [
                  {
                    "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                    "branch": "CPI",
                    "date": currentTimeInMs - 1,
                    "loc": 22,
                    "revision": "3",
                    "type": "trs"
                  }
                ]

					}]
				}
			}
        };

        assertAggregateCommits(filters, data, 'day', expected, done);
    });

    it('Commit distribution only trunk commits ', function (done) {
        var data = [{
            time: currentTimeInMs,
            author:"baby",
            sc:"trs",
            day:currentTimeInMs,
            type: 'trs',
            path: 'svn1',
            branch: 'trunk',
            date: currentTime - 4,
            loc: 4,
            revision: '1',
			"bl":"SM"
        }, {
            time: currentTimeInMs - 1,
            author:"baby",
            sc:"trs",
            day:currentTimeInMs,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: currentTime - 3,
            loc: 5,
            revision: '2',
			"bl":"SM"
        }, {
            time: currentTimeInMs,
            author:"baby",
            sc:"trs",
            day:currentTimeInMs,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: currentTime - 2,
            loc: 6,
            revision: '3',
			"bl":"SM"
        }];
        var expected = {
            "trs": {
                "total_commits": 3,
                "trunk": {
                    "count": 3,
                    "loc": 15, 
                    "revisiondata": [
              {
                "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                "branch": "trunk",
                "date": currentTimeInMs,
                "loc": 4,
                "revision": "1",
                "type": "trs"
              },
              {
                "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                "branch": "trunk",
                "date": currentTimeInMs - 1,
                "loc": 5,
                "revision": "2",
                "type": "trs"
              },
              {
                "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                "branch": "trunk",
                "date": currentTimeInMs,
                "loc": 6,
                "revision": "3",
                "type": "trs"
              }
            ]

                },
                "trunk_distribution": "100"
            }
        };

        assertCommitDistribution(data, expected, done);
    });

    it('Commit distribution : trunk and branch commits ', function (done) {
        var data = [{
            time: currentTimeInMs,
            author:"baby",
            sc:"trs",
            day:currentTimeInMs,
            type: 'trs',
            path: 'svn1',
            branch: 'cpi',
            date: currentTime - 4,
            loc: 4,
            revision: '1'
        }, {
            time: currentTimeInMs - 1,
            author:"baby",
            sc:"trs",
            day:currentTimeInMs,
            type: 'trs',
            path: 'svn2',
            branch: 'cpi',
            date: currentTime - 3,
            loc: 5,
            revision: '2'
        }, {
            time: currentTimeInMs,
            author:"baby",
            sc:"trs",
            day:currentTimeInMs,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: currentTime - 2,
            loc: 6,
            revision: '3'
        }, {
            time: currentTimeInMs,
            author:"baby",
            sc:"trs",
            day:currentTimeInMs,
            type: 'trs',
            path: 'svn2',
            branch: 'trunk',
            date: currentTime - 2,
            loc: 6,
            revision: '4'
        }];
        var expected = {
            "trs": {
                "total_commits": 4,
                "cpi": {
                    "count": 2,
                    "loc": 9,
                "revisiondata": [
              {
                "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                "branch": "cpi",
                "date": currentTimeInMs,
                "loc": 4,
                "revision": "1",
                "type": "trs"
              },
              {
                "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                "branch": "cpi",
                "date": currentTimeInMs -1,
                "loc": 5,
                "revision": "2",
                "type": "trs"
              }
            ]

                },
                "trunk": {
                    "count": 2,
                    "loc": 12,
                "revisiondata": [
              {
                "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                "branch": "trunk",
                "date": currentTimeInMs,
                "loc": 6,
                "revision": "3",
                "type": "trs"
              },
              {
                "bl": "NA",
            "author":"baby",
            "sc":"trs",
            "day":currentTimeInMs,
                "branch": "trunk",
                "date": currentTimeInMs,
                "loc": 6,
                "revision": "4",
                "type": "trs"
              }
            ]

                },
                "trunk_distribution": "50"
            }
        };

        assertCommitDistribution(data, expected, done);
    });

    function assertFetchedCommits(filters, expected, done) {
        try {
            commit_metrics.fetchCommits(filters, function (e, commits) {
                expect(e).to.eql(null);
                expect(commits).to.eql(expected);
                done();
            });
        } catch (x) {
            done(x);
        }
    }

    function assertAggregateCommits(filter, commits, aggregation, expected, done) {
        try {
            var result = commit_metrics.aggregateCommits(commits, filter.begin, filter.end, aggregation);
            expect(result).to.eql(expected);
            done();

        } catch (x) {
            console.log(x);
            done(x);
        }
    }

    function assertCommitDistribution(commits, expected, done) {
        try {
            var result = commit_metrics.getCommitDistribution(commits);
            expect(result).to.eql(expected);
            done();

        } catch (x) {
            console.log(x);
            done(x);
        }
    }
});
