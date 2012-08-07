'use strict';

var util = require('util'),
	Stream = require('stream'),
	AbstractWriter = require('../abstractWriter');

function JsonWriter() {
	JsonWriter.super_.call(this);
}

/*global exports:true*/
exports = module.exports = JsonWriter;
util.inherits(JsonWriter, AbstractWriter);
/*global exports:false*/

var proto = JsonWriter.prototype;

/**
 * The implementation of the Stream that serializes the provided Object into a string
 * @override
 * @return {Stream} the Read Stream 
 */
proto._doCreateReadStream = function (data) {
	return new ReadStream(data);
};




var ReadStream = function ReadStream(data) {
	Stream.call(this);
	this._data = data;
};

util.inherits(ReadStream, Stream);

ReadStream.prototype.pause = function () {
	// noop
};

// WriteStream Implementation
ReadStream.prototype.resume = function () {
	try {
		this._nextTickEmit('data', this._serialize(this._data));
		this._nextTickEmit('end');
	} catch (err) {
		this._nextTickEmit('error', err);
	}

	this._nextTickEmit('close');
	this._data = null;
};

ReadStream.prototype._serialize = function (data) {
	return JSON.stringify(data, null, 2);
};


ReadStream.prototype._nextTickEmit = function () {
	var args = Array.prototype.slice.call(arguments);
	process.nextTick(function () {
		this.emit.apply(this, args);
	}.bind(this));
};
