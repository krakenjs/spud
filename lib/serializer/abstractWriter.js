'use strict';

var util = require('util'),
	Stream = require('stream');


function AbstractWriter() {
	AbstractWriter.super_.call(this);
	this._data = null;
	this._chunks = [];
	this._chunkLength = 0;
}

/*global exports:true*/
exports = module.exports = AbstractWriter;
util.inherits(AbstractWriter, Stream);
/*global exports:false*/

var proto = AbstractWriter.prototype;

proto.createReadStream = function() {
	throw new Error('Not implemented.');
};


// ReadStream Implementation
proto.write = function (data) {
	this._data = data;
	return true;
};


proto.end = function () {
	// Ready to serialize
};

