var mongoskin = require('mongoskin');
var expect = require('expect.js');

before(function(done) {
    if (process.env.FALCON_TEST_URL == undefined) {
        process.env.FALCON_API_PORT = Math.round(Math.random() * 10000) + 10000;
        process.env.FALCON_TEST_URL = 'http://localhost:'+ process.env.FALCON_API_PORT +'/api';
        process.env.FALCON_TEST_URL_COMMIT = 'http://localhost:'+ process.env.FALCON_API_PORT +'/commit';
        process.env.FALCON_DB_URL = 'mongodb://@localhost:27017/unittest' + Date.now();//mongodbUrl;
        process.env.FALCON_REDIS_CHANNEL_NAME = 'events/test' + Date.now();
    }

    var app = require('../app.js');    
    // in UT, no need to write log to file and SMTP
    var log4js = require('log4js');
    log4js.configure({
        appenders: [
            { type: 'console' }
        ]
    });
    app.listen(process.env.FALCON_API_PORT);
    done();
});

after(function(done) {
    var db = mongoskin.db(process.env.FALCON_DB_URL, {safe:true});
    db.dropDatabase(function(err) {
        expect(err).to.not.be.ok();
        db.close(done);
    });
});
