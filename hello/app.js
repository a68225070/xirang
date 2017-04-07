'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var settings = require('./settings');
var app = express();

var  session = require('express-session');
var  MongoStore = require('connect-mongo/es5')(session);

var _ = require('lodash-node');

var aa = [{name:'others'},
{name:'others'},
{name:'others1'},
{name:'others'},
{name:'others2'},
{name:'others2'},
{name:'others'},
{name:'others3'},
         ];

/*
var bb = _.filter(aa,{name:'others2'});
console.log(bb);
console.log(bb.length)*/

var bb = _.groupBy(aa,function(d){
    return d.name;
})
console.log(bb);

var cc = _.map(bb,function(val,key){
    var tmp = {};
    tmp[key] = val.length;
    return tmp;
})
console.log(cc)

app.use(session({
    secret:settings.SN,
    saveUninitialized:false,
    resave:true,
//    cookie:{maxAge:5000},
    store:new MongoStore({
        db:settings.DB,
        ttl: 15 * 60,
//        autoRemove: 'interval',
//        autoRemoveInterval: 2 // In minutes. Default 
    })
}))

var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
  ]
});

console.log(settings.store());

var getLogger = require('./logging').getLogger;
var logger = getLogger('app');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(log4js.connectLogger(getLogger('normal'), {
    level: 'auto',
    format: ':remote-addr - :method :url :status :content-length - :response-time ms'
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', index);
//app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  logger.error(err.stack);
  // render the error page
  res.status(err.status || 500);
//  res.render('error');
  res.send( (err.status||500) + ":" + 'Not Found');
});

module.exports = app;
