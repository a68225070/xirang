var express = require('express');
var path = require('path');


var app = express();
//var server = require('http').Server(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html',require('ejs').__express);

require('./index')(app);
/*
server.listen(80,function(){
   console.log('XiRang start on port 80');
});
*/
module.exports=app;
