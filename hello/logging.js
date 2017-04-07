var log4js = require('log4js');

module.exports.getLogger = function(name, level) {
  var logger = log4js.getLogger(name);
  var level = level || 'DEBUG';
  logger.setLevel(level);

  return logger
}
