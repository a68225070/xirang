'use strict';

var sinon = require('sinon');

module.exports = function() {
	function LoggerMock() {
	}
	LoggerMock.warn = sinon.expectation.create('collection.findOne');
	LoggerMock.error = sinon.expectation.create('collection.updateOne');

	return LoggerMock;
}

