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

/**
 * Public API for invoking serialization on steramed in data
 * @param  {Function} callback the callback to invoke with the err or deserialized data details
 */
proto.deserialize = function (callback) {
	this._doDeserialize(this._data, callback);
};

/**
 * Abstract method to be overridden by implementing classes
 * @param  {String}   data     the string data to deserialize
 * @param  {Function} callback the callback to invoke with error or deserialized data
 */
proto._doDeserialize = function (data, callback) {
	throw new Error('Not implemented');
};


// Write Stream Implementation

/**
 * Implementation of Stream#write(Buffer)
 * @param  {Buffer} chunk the currently read chunk
 * @return {boolean}      true if ok to continue streaming, false to pause
 */
proto.write = function (chunk) {
	this._chunks.push(chunk);
	this._chunkLength += chunk.length;
	return true;
};

/**
 * Implementation of Stream#end()
 */
proto.end = function () {
	this._data = Buffer.concat(this._chunks, this._chunkLength).toString('utf8');
};

