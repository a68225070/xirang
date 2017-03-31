'use strict';

var expect = require('expect.js');
var model = require('../../../models/scci_feedback_stats');


describe('models/scci_feedback_stats', function () {

    describe('countTimes', function () {

        it('get empty results on empty data', function () {
            var commits = [];

            expect(model.countTimes(commits, 'type')).to.eql([]);
        });

        it('get empty results on empty promotion data', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000000
                    }]
                }
            };
            var expected = [];

            expect(model.countTimes(commits, 'type')).to.eql(expected);
        });

    });

    describe('countAllResults', function () {

        it('results are sorted by feedback time', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000000,
                        buildstart: 1400000003,
                        promotedtime: 1400000005
                    }]
                },
                def: {
                    trunk: [{
                        type: 'def',
                        branch: 'trunk',
                        date: 1400000000,
                        buildstart: 1400000001,
                        promotedtime: 1400000002
                    }]
                },
                xyz: {
                    trunk: [{
                        type: 'xyz',
                        branch: 'trunk',
                        date: 1400000000,
                        buildstart: 1400000005,
                        promotedtime: 1400000007
                    }]
                }
            };
            var expected = [{
                type: 'def', stats: {
                    feedbackTime: {median: 2, min: 2, max: 2, mean: 2, stdev: 0},
                    waitingTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    executionTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0}
                }
            }, {
                type: 'abc', stats: {
                    feedbackTime: {median: 5, min: 5, max: 5, mean: 5, stdev: 0},
                    waitingTime: {median: 3, min: 3, max: 3, mean: 3, stdev: 0},
                    executionTime: {median: 2, min: 2, max: 2, mean: 2, stdev: 0}
                }
            }, {
                type: 'xyz', stats: {
                    feedbackTime: {median: 7, min: 7, max: 7, mean: 7, stdev: 0},
                    waitingTime: {median: 5, min: 5, max: 5, mean: 5, stdev: 0},
                    executionTime: {median: 2, min: 2, max: 2, mean: 2, stdev: 0}
                }
            }];

            expect(model.countAllResults(commits, 'type')).to.eql(expected);
        });

        it('commits before first and after last promotion are ignored', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000000
                    }, {
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000001,
                        buildstart: 1400000002,
                        promotedtime: 1400000003
                    }, {
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000004
                    }]
                }
            };
            var expected = [{
                type: 'abc',
                stats: {
                    feedbackTime: {median: 2, min: 2, max: 2, mean: 2, stdev: 0},
                    waitingTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    executionTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0}
                }
            }];

            expect(model.countAllResults(commits, 'type')).to.eql(expected);
        });

        it('results are counted for all commits', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000001,
                        buildstart: 1400000001,
                        promotedtime: 1400000002
                    }, {
                        time: 1400000000000,
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000002,
                        message: ''
                    }, {
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000003
                    }, {
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000004,
                        buildstart: 1400000005,
                        promotedtime: 1400000006
                    }]
                }

            };
            var expected = [{
                type: 'abc',
                stats: {
                    feedbackTime: {median: 2.5, min: 1, max: 4, mean: 2.5, stdev: 1.118033988749895},
                    waitingTime: {median: 1.5, min: 0, max: 3, mean: 1.5, stdev: 1.118033988749895},
                    executionTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0}
                }
            }];

            expect(model.countAllResults(commits, 'type')).to.eql(expected);
        });

        it('minimum start date is taken in waiting time calculations', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000001,
                        mtstart: 1400000006,
                        utstart: 1400000004,
                        sctstart: 1400000005,
                        promotedtime: 1400000009
                    }]
                }
            };
            var expected = [{
                type: 'abc',
                stats: {
                    feedbackTime: {median: 8, min: 8, max: 8, mean: 8, stdev: 0},
                    waitingTime: {median: 3, min: 3, max: 3, mean: 3, stdev: 0},
                    executionTime: {median: 5, min: 5, max: 5, mean: 5, stdev: 0}
                }
            }];

            expect(model.countAllResults(commits, 'type')).to.eql(expected);
        });

        it('negative waiting time is treated as zero', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000002,
                        buildstart: 1400000001,
                        promotedtime: 1400000003
                    }]
                }
            };
            var expected = [{
                type: 'abc',
                stats: {
                    feedbackTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    waitingTime: {median: 0, min: 0, max: 0, mean: 0, stdev: 0},
                    executionTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0}
                }
            }];

            expect(model.countAllResults(commits, 'type')).to.eql(expected);
        });

        it('negative execution time is treated as zero', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000002,
                        buildstart: 1400000004,
                        promotedtime: 1400000003
                    }]
                }
            };
            var expected = [{
                type: 'abc',
                stats: {
                    feedbackTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    waitingTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    executionTime: {median: 0, min: 0, max: 0, mean: 0, stdev: 0}
                }
            }];

            expect(model.countAllResults(commits, 'type')).to.eql(expected);
        });

        it('empty results are not returned', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000001
                    }],
                    br: [{
                        type: 'abc',
                        branch: 'br',
                        date: 1400000002
                    }]
                }
            };
            var expected = [];

            expect(model.countAllResults(commits, 'type')).to.eql(expected);
        });

        it('maximum promotion date is taken in calculations', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000001,
                        buildstart: 1400000002,
                        Xpromotedtime: 1400000004,
                        Ypromotedtime: 1400000003
                    }]
                }
            };
            var expected = [{
                type: 'abc',
                stats: {
                    feedbackTime: {median: 3, min: 3, max: 3, mean: 3, stdev: 0},
                    waitingTime: {median: 1, min: 1, max: 1, mean: 1, stdev: 0},
                    executionTime: {median: 2, min: 2, max: 2, mean: 2, stdev: 0}
                }
            }];

            expect(model.countAllResults(commits, 'type')).to.eql(expected);
        });

    });

    describe('countTrendResults', function () {

        it('results are grouped by time interval', function () {
            var commits = {
                abc: {
                    trunk: [{
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000001,
                        promotedtime: 1400000002
                    }, {
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400000101,
                        promotedtime: 1400000103
                    }, {
                        type: 'abc',
                        branch: 'trunk',
                        date: 1400100001,
                        promotedtime: 1400100003
                    }]
                }
            };
            var expected = [{
                date: 1400083199999,
                stats: {
                    mean: 1.5,
                    stdev: 0.5,
                    median: 1.5,
                    min: 1,
                    max: 2
                }
            }, {
                date: 1400169599999,
                stats: {
                    mean: 2,
                    stdev: 0,
                    median: 2,
                    min: 2,
                    max: 2
                }
            }];

            expect(model.countTrendResults(commits, 'day')).to.eql(expected);
        });

    });

    describe('countStepDurationResults', function () {

        it('get empty results on empty data', function () {
            var commits = [];
            var expected = {};

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('get empty results on empty step data', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001
            }];
            var expected = {};

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('results are counted for single commit single step', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEPstart: 1400000002,
                STEPend: 1400000003,
                STEPresult: 'PASS'
            }];
            var expected = {
                STEP: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('results are counted for single commit multiple step', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000002,
                STEP1end: 1400000003,
                STEP1result: 'PASS',
                STEP2start: 1400000004,
                STEP2end: 1400000006,
                STEP2result: 'PASS'
            }];
            var expected = {
                STEP1: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                },
                STEP2: {
                    mean: 2,
                    stdev: 0,
                    median: 2,
                    min: 2,
                    max: 2
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('results are counted for multiple commits single step', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEPstart: 1400000002,
                STEPend: 1400000003,
                STEPresult: 'PASS'
            }, {
                type: 'abc',
                branch: 'trunk',
                date: 1400000101,
                STEPstart: 1400000102,
                STEPend: 1400000107,
                STEPresult: 'PASS'
            }];
            var expected = {
                STEP: {
                    mean: 3,
                    stdev: 2,
                    median: 3,
                    min: 1,
                    max: 5
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('results are counted for multiple commits multiple step', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000002,
                STEP1end: 1400000003,
                STEP1result: 'PASS',
                STEP2start: 1400000002,
                STEP2end: 1400000007,
                STEP2result: 'PASS'
            }, {
                type: 'abc',
                branch: 'trunk',
                date: 1400000101,
                STEP2start: 1400000103,
                STEP2end: 1400000106,
                STEP2result: 'PASS',
                STEP3start: 1400000202,
                STEP3end: 1400000204,
                STEP3result: 'PASS'
            }];
            var expected = {
                STEP1: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                },
                STEP2: {
                    mean: 4,
                    stdev: 1,
                    median: 4,
                    min: 3,
                    max: 5
                },
                STEP3: {
                    mean: 2,
                    stdev: 0,
                    median: 2,
                    min: 2,
                    max: 2
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('only full step data is taken for calculactions', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000002,
                STEP1end: 1400000003,
                STEP1result: 'PASS',
                STEP2start: 1400000004,
                STEP2result: 'PASS',
                STEP3start: 1400000005,
                STEP3end: 1400000007,
                STEP4end: 1400000008,
                STEP4result: 'PASS',
                STEP5start: 1400000009,
                STEP5end: 1400000011,
                STEP5result: 'PASS'
            }];
            var expected = {
                STEP1: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                },
                STEP5: {
                    mean: 2,
                    stdev: 0,
                    median: 2,
                    min: 2,
                    max: 2
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('FAIL step data is not taken for calculactions', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000002,
                STEP1end: 1400000003,
                STEP1result: 'PASS',
                STEP2start: 1400000004,
                STEP2end: 1400000006,
                STEP2result: 'FAIL',
                STEP3start: 1400000007,
                STEP3end: 1400000009,
                STEP3result: 'PASS'
            }];
            var expected = {
                STEP1: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                },
                STEP3: {
                    mean: 2,
                    stdev: 0,
                    median: 2,
                    min: 2,
                    max: 2
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('step names are trimmed', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1_start: 1400000002,
                STEP1_end: 1400000003,
                STEP1_result: 'PASS',
                STEP2start: 1400000002,
                STEP2end: 1400000004,
                STEP2result: 'PASS'
            }];
            var expected = {
                STEP1: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                },
                STEP2: {
                    mean: 2,
                    stdev: 0,
                    median: 2,
                    min: 2,
                    max: 2
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('step names are in uppercase', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                step1start: 1400000002,
                step1end: 1400000003,
                step1result: 'PASS',
                Step2start: 1400000002,
                Step2end: 1400000004,
                Step2result: 'PASS'
            }, {
                type: 'abc',
                branch: 'trunk',
                date: 1400000002,
                STEP1_start: 1400000003,
                STEP1_end: 1400000008,
                STEP1_result: 'PASS'
            }];
            var expected = {
                STEP1: {
                    mean: 3,
                    stdev: 2,
                    median: 3,
                    min: 1,
                    max: 5
                },
                STEP2: {
                    mean: 2,
                    stdev: 0,
                    median: 2,
                    min: 2,
                    max: 2
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('different timestamp formats are supported', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000002,
                STEP1end: 1400000003,
                STEP1result: 'PASS',
                STEP2start: 1400000002000,
                STEP2end: 1400000005000,
                STEP2result: 'PASS'
            }];
            var expected = {
                STEP1: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                },
                STEP2: {
                    mean: 3,
                    stdev: 0,
                    median: 3,
                    min: 3,
                    max: 3
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

        it('negative step duration is treated as zero', function () {
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000003,
                STEP1end: 1400000002,
                STEP1result: 'PASS',
                STEP2start: 1400000004,
                STEP2end: 1400000007,
                STEP2result: 'PASS'
            }];
            var expected = {
                STEP1: {
                    mean: 0,
                    stdev: 0,
                    median: 0,
                    min: 0,
                    max: 0
                },
                STEP2: {
                    mean: 3,
                    stdev: 0,
                    median: 3,
                    min: 3,
                    max: 3
                }
            };

            expect(model.countStepDurationResults(commits)).to.eql(expected);
        });

    });


    describe('countCategoryResults', function () {

        it('get empty results on empty data', function () {
            var testCategories = {};
            var commits = [];
            var expected = {};

            expect(model.countCategoryResults(commits, testCategories)).to.eql(expected);
        });

        it('get empty results on empty step data', function () {
            var testCategories = {};
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001
            }];
            var expected = {};

            expect(model.countCategoryResults(commits, testCategories)).to.eql(expected);
        });

        it('results are counted for single commit single step in one category', function () {
            var testCategories = {STEP: 'CAT'};
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEPstart: 1400000002,
                STEPend: 1400000003,
                STEPresult: 'PASS'
            }];
            var expected = {
                CAT: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                }
            };

            expect(model.countCategoryResults(commits, testCategories)).to.eql(expected);
        });

        it('results are counted for single commit multiple step in one category', function () {
            var testCategories = {STEP1: 'CAT', STEP2: 'CAT', STEP3: 'CAT'};
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000004,
                STEP1end: 1400000006,
                STEP1result: 'PASS',
                STEP2start: 1400000002,
                STEP2end: 1400000005,
                STEP2result: 'PASS',
                STEP3start: 1400000005,
                STEP3end: 1400000006,
                STEP3result: 'PASS'
            }];
            var expected = {
                CAT: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                }
            };

            expect(model.countCategoryResults(commits, testCategories)).to.eql(expected);
        });

        it('results are counted for multiple commits single step in one category', function () {
            var testCategories = {STEP: 'CAT'};
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEPstart: 1400000002,
                STEPend: 1400000003,
                STEPresult: 'PASS'
            }, {
                type: 'abc',
                branch: 'trunk',
                date: 1400000101,
                STEPstart: 1400000103,
                STEPend: 1400000107,
                STEPresult: 'PASS'
            }];
            var expected = {
                CAT: {
                    mean: 1.5,
                    stdev: 0.5,
                    median: 1.5,
                    min: 1,
                    max: 2
                }
            };

            expect(model.countCategoryResults(commits, testCategories)).to.eql(expected);
        });

        it('results are counted for multiple commits multiple step in one category', function () {
            var testCategories = {STEP1: 'CAT', STEP2: 'CAT', STEP3: 'CAT'};
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000002,
                STEP1end: 1400000003,
                STEP1result: 'PASS',
                STEP2start: 1400000002,
                STEP2end: 1400000007,
                STEP2result: 'PASS'
            }, {
                type: 'abc',
                branch: 'trunk',
                date: 1400000101,
                STEP2start: 1400000105,
                STEP2end: 1400000107,
                STEP2result: 'PASS',
                STEP3start: 1400000202,
                STEP3end: 1400000204,
                STEP3result: 'PASS'
            }];
            var expected = {
                CAT: {
                    mean: 2.5,
                    stdev: 1.5,
                    median: 2.5,
                    min: 1,
                    max: 4
                }
            };

            expect(model.countCategoryResults(commits, testCategories)).to.eql(expected);
        });

        it('results are counted for single commit multiple step in two categories', function () {
            var testCategories = {STEP1: 'CAT1', STEP2: 'CAT1', STEP3: 'CAT2', STEP4: 'CAT2'};
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000004,
                STEP1end: 1400000006,
                STEP1result: 'PASS',
                STEP2start: 1400000002,
                STEP2end: 1400000005,
                STEP2result: 'PASS',
                STEP3start: 1400000005,
                STEP3end: 1400000006,
                STEP3result: 'PASS',
                STEP4start: 1400000006,
                STEP4end: 1400000009,
                STEP4result: 'PASS'
            }];
            var expected = {
                CAT1: {
                    mean: 1,
                    stdev: 0,
                    median: 1,
                    min: 1,
                    max: 1
                },
                CAT2: {
                    mean: 4,
                    stdev: 0,
                    median: 4,
                    min: 4,
                    max: 4
                }
            };

            expect(model.countCategoryResults(commits, testCategories)).to.eql(expected);
        });

        it('results are counted for multiple commits multiple step in two categories', function () {
            var testCategories = {STEP1: 'CAT1', STEP2: 'CAT1', STEP3: 'CAT2', STEP4: 'CAT2'};
            var commits = [{
                type: 'abc',
                branch: 'trunk',
                date: 1400000001,
                STEP1start: 1400000002,
                STEP1end: 1400000003,
                STEP1result: 'PASS',
                STEP2start: 1400000002,
                STEP2end: 1400000007,
                STEP2result: 'PASS',
                STEP3start: 1400000003,
                STEP3end: 1400000007,
                STEP3result: 'PASS'
            }, {
                type: 'abc',
                branch: 'trunk',
                date: 1400000101,
                STEP2start: 1400000105,
                STEP2end: 1400000107,
                STEP2result: 'PASS',
                STEP3start: 1400000203,
                STEP3end: 1400000204,
                STEP3result: 'PASS',
                STEP4start: 1400000202,
                STEP4end: 1400000204,
                STEP4result: 'PASS'
            }];
            var expected = {
                CAT1: {
                    mean: 2.5,
                    stdev: 1.5,
                    median: 2.5,
                    min: 1,
                    max: 4
                },
                CAT2: {
                    "mean": 51.5,
                    "stdev": 49.5,
                    "median": 51.5,
                    "min": 2,
                    "max": 101
                }
            };

            expect(model.countCategoryResults(commits, testCategories)).to.eql(expected);
        });

    });

});
