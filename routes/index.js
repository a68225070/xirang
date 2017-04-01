var express = require('express');
var router = express.Router();

/*
var db = require('../settings').DB;
var logger = require('../logging').getLogger('routes');
router.get('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    return next();
});
*/

router.use('/api', require('./api/index'));
module.exports = router;

