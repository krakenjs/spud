'use strict';

var util = require('util'),
	Stream = require('stream');


function AbstractReader() {
	AbstractReader.super_.call(this);
	this._data = null;
	this._chunks = [];
	this._chunkLength = 0;
}

/*global exports:true*/
exports = module.exports = AbstractReader;
util.inherits(AbstractReader, Stream);
/*global exports:false*/

var proto = AbstractReader.prototype;

proto.createReadStream = function() {
	throw new Error('Not implemented.');
};


// ReadStream Implementation
proto.write = function (chunk) {
	this._chunks.push(chunk);
	this._chunkLength += chunk.length;
	return true;
};


proto.end = function () {
	this._data = Buffer.concat(this._chunks, this._chunkLength);
};

