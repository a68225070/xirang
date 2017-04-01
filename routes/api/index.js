var express = require('express');
var router = express.Router();

var commits = require('./commits');
router.use('/commits', commits);

module.exports = router;
