var util = require('util');
var jsSHA = require('jssha');
var moment = require('moment');
var request = require('request');

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort();
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

var Auth = {
    isValid: function (req) {
        if (!req.headers.authorization) return false;

      var encoded = req.headers.authorization.split(' ')[1];
        var decoded = new Buffer(encoded, 'base64').toString('utf8');
        var id = decoded.split(':')[0];
        var secret = decoded.split(':')[1];

        for (var i = 0; i < apps.length; i++) {
            if(id === apps[i].appId && secret === apps[i].appSecret){
                return true;
            }
        }
        return false;
    }
}

function callRobot(info,res){
    var post_data = quetystring.stringify({
        key: 'bc7483a3e69e4a58ac87f2c0949a58ae',
        info: info,
        userid: 'xirang'
    });
    var options = {
        host: 'www.tuling123.com',
        port: 80,
        path: '/openapi/api',
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
                "Content-Type": 'application/x-www-form-urlencoded', //这个一定要有
        }
    };
    var tmpstr='我累了，下次再聊吧!';
    request(options,function(error,response,data){
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));

        if(!error && response.statusCode == 200){
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));
            tmpstr = response.data;
        }else{
            console.log("Call robot failed!");
        }
	    var send = util.format('<xml><ToUserName><![CDATA[%s]]></ToUserName><FromUserName><![CDATA[%s]]></FromUserName><CreateTime>%s</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[%s]]></Content></xml>',indata.fromusername,indata.tousername,moment().unix(),'hello how are you');
	    console.log(send);
	    res.end(send);

    
    }
}

function getyuyi(token,query,appid){
   var url = 'https://api.weixin.qq.com/semantic/semproxy/search?access_token='+token.access_token;
   query="东风汽车";
   var post = {access_token:token.access_token,
	       query:query,
	       "city":"北京",
	       "category": "stock",
	       appid:appid,
               uid:'123456'
	      };
    console.log('post data to yuyi%j',post);

      request(url, function (error, response, data) {
       console.log('request callback called');
	      if (!error && response.statusCode == 200) {
        	console.log("recived data: " + data);
		       if(typeof data === 'string'){
			    data = JSON.parse(data);
			}
			if (data.errcode) {
			    console.log(data.errcode + ':' + data.errmsg);
			}else{
			    console.log('Got data %j',data);
			}
	      } else {
        	console.log(error);
      	      }
	});   
}

module.exports = function(app){
	var AccessToken = require('./lib/accessToken');
	var config = require('./setting.json');
	var storeFactory = require('./lib/store/factory');
	var wxAppId = config.wxAppId;
	var wxAppSecret = config.wxAppSecret;
	var apps = config.auth.apps;
	var token = new AccessToken(wxAppId,wxAppSecret,storeFactory.get(config.store || 'memory'));

	
    app.get('/',function(req,res,next){
       res.render('xirang',{issuccess:"Hello this is XiRang success"});
   });

   app.get('/pub/:view',function(req,res,next){
       console.log("###id=%s",req.params.view);
       res.render(req.params.view,{issuccess:"获取二维码页面"});
   });

  
   app.get('/interface',function(req,res,next){
      var signature = req.query.signature||'';
      var timestamp = parseInt(req.query.timestamp||'0');
      var nonce = req.query.nonce||'';
      var TOKEN = 'xirang';
      var echostr = req.query.echostr||'';
      var grant_type = 'client_credential';
      var appid='wx9f7e27c6297a4437';

      if (signature ==''){
        return next();
      }
      console.log("#### have some call from port\nrecived:\n signature=%s timestamp=%s nonce=%s",signature,timestamp,nonce);
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
      var indata = req.body.xml;
      console.log("Recived Message:\n%j\n####################",indata);
      if (indata.fromusername){
          res.writeHead(200, {'Content-Type': 'text/xml'});
          var openid = req.query.openid||'';
          if (openid && openid !=''){
	    if (config.auth.enable !==false && !Auth.isValid(req)) {
		console.log('auth fail');
	    }else{
		console.log('auth pass');
	    } 
            
	      token.getToken().then(
		function (data) {
		   console.log('token=%j',data);
		   //console.log('begin call yuyi');
		   //getyuyi(data,'查一下明天从北京到上海的南航机票',wxAppId);
		},
		function (err) {
		    console.error('token fail %s',err);
		}
	      );
		callRobot (indata.content,res);
      }else{
            res.send('success');
          }
      }
   });
};
