##app.js
```
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    {
      type: 'file',
      filename: 'logs/access.log',
      maxLogSize: 10 * 1024 * 1024,
      backups: 4
    },
    {
        type: 'logLevelFilter',
        level: 'ERROR',
        appender: {
            type: 'smtp',
            recipients: 'naja@163.com',
            sender: 'falcon@noreply.com',
            sendInterval: 300,
            SMTP: {
                host: '10.130.128.21',
                port: 25,
                secure: false,
                ignoreTLS: true
            }
        }
    }
  ]
});


var getLogger = require('./##logging.js').getLogger;

app.use(log4js.connectLogger(getLogger('normal'), {
    level: 'auto',
    format: ':remote-addr - :method :url :status :content-length - :response-time ms'
}));

var logger = getLogger('app');
logger.info("The service started.!");

```
### router.js
```
var logger = require('../logging').getLogger('api/scbuilds');
logger.info("The service started.!");
```


##logging.js
```
var log4js = require('log4js');

module.exports.getLogger = function(name, level) {
  var logger = log4js.getLogger(name);
  var level = level || 'DEBUG';
  logger.setLevel(level);

  return logger
}
```
