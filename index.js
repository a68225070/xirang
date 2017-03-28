var jsSHA = require('jssha');
var moment = require('moment');

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

function getsha(intext){
  console.log("source text:%s",intext);
  var shaObj = new jsSHA(intext, 'TEXT');
  var signature = shaObj.getHash('SHA-1', 'HEX');
  return signature;
}
/*
var getsign = function (indata ) {
  var string = raw(indata);
  console.log("new string=%s",string);
  return getsha(string);
};
*/

module.exports = function(app){
   app.get('/interface',function(req,res,next){
      var signature = req.query.signature||'';
      var timestamp = parseInt(req.query.timestamp||'0');
      var nonce = req.query.nonce||'';
      var TOKEN = 'xirang';
      var echostr = req.query.echostr||'';
      var grant_type = 'client_credential';
      var appid='wx9f7e27c6297a4437';
      var secret='53f06963d5e1c00a5a12e0436b288d26';

      if (signature ==''){
        return next();
      }
      console.log("#### have some call from 80 port\nrecived:\n signature=%s timestamp=%s nonce=%s",signature,timestamp,nonce);
/*      var tmpobj = {
        token: TOKEN,
        nonce: nonce,
        timestamp: timestamp
      };
      var new_signature = getsign(tmpobj);
*/
      var s2 = [TOKEN,timestamp,nonce];
      s2.sort();
      var new_signature = getsha(s2.join(''));
      console.log(new_signature);
      if (new_signature == signature){
        console.log("auth success");
        res.send(echostr);
      }
      res.render('xirang',{issuccess:"Hello success"});
   });
   app.post('/interface',function(req,res){
      console.log("recived data");
      console.log(req.query);
      var openid = req.query.openid||'';
      if (openid && openid !=''){
        var send = {ToUserName:openid,
                    FromUserName:'xirang',
                    CreateTime:moment().unix(),
                    MsgType:'text',
                    Content:'Welcome talk With XiRang robot!'};
        console.log(send);
        res.send(send);
      }
   });
};
