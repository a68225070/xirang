var express = require('express');
var router = express.Router();
var settings = require('../settings');
var parseurl = require('parseurl');


router.use(function (req, res, next) {
  console.log(settings.store())
  var views = req.session.views
  if (!views) {
    views = req.session.views = {}
  }
  var pathname = parseurl(req).pathname
  if (pathname == '/foo'){
    views[pathname] = (views[pathname] || 0) + 1
  }
  next()
})

router.get('/foo', function (req, res, next) {
  console.log(res)
  res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
})

router.get('/clear', function (req, res, next) {
  res.clearCookie(settings);
  res.send('you cookie already clearn')
})



module.exports = router;
