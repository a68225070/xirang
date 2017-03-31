'use strict';

var sinon = require('sinon');

module.exports = function() {
	function CollectionMock() {
	}
	CollectionMock.findOne = sinon.expectation.create('collection.findOne');
	CollectionMock.updateOne = sinon.expectation.create('collection.updateOne');

	return CollectionMock;
}

