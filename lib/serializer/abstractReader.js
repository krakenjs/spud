'use strict';

var util = require('util'),
	WriteStream = require('../writeStream');


function AbstractReader() {
	AbstractReader.super_.call(this);
}

/*global exports:true*/
exports = module.exports = AbstractReader;
util.inherits(AbstractReader, WriteStream);
/*global exports:false*/

var proto = AbstractReader.prototype;

proto.__defineSetter__('data', function (value) {
	this._data = value;
});

/**
 * Public API for invoking serialization on steramed in data
 * @param  {Function} callback the callback to invoke with the err or deserialized data details
 */
proto.deserialize = function (callback) {
	this._doDeserialize(this._data.toString('utf8'), callback);
};

/**
 * Abstract method to be overridden by implementing classes
 * @param  {String}   data     the string data to deserialize
 * @param  {Function} callback the callback to invoke with error or deserialized data
 */
proto._doDeserialize = function (data, callback) {
	throw new Error('Not implemented');
};
