var express = require('express');
var path = require('path');
var app = express();

var bodyParser = require("body-parser");
require('body-parser-xml')(bodyParser);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html',require('ejs').__express);

app.use(bodyParser.json());
app.use(bodyParser.xml({
  limit: '1MB',
  xmlParseOptions: {
    normalize: true,
    normalizeTags: true,
    explicitArray: false
  }
}));

require('./index')(app);



module.exports=app;
