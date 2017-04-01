var url = require('url');
var mongoskin = require('mongoskin');
var mongodbUrl = process.env.FALCON_DB_URL || 'mongodb://@127.0.0.1:27017/pipeline';

module.exports.mongodbUrl = mongodbUrl;
module.exports.DB = mongoskin.db(mongodbUrl, {safe:true});



