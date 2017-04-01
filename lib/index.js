"use strict"
var config = require('../setting.json');
var storeFactory = require('./store/factory');


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
var AccessToken  = function (app) {
  console.log("begin@");
  var wxAppId = config.wxAppId;
  var wxAppSecret = config.wxAppSecret;
  var apps = config.auth.apps;
  var token = new AccessToken(wxAppId,wxAppSecret,storeFactory.get(config.store || 'memory'));
};

AccessToken.prototype = {
    getToken: function (req,res) {
       if (config.auth.enable !== false && !Auth.isValid(req)) {
            return 'NA';
        }
        token.getToken().then(
            function (data) {
                console.log("Got tokken %s",data);
                return data;
            },
            function (err) {
              console.error(err);
              return 'NA';
            }
        );
    }
}


exports = module.exports = AccessToken
