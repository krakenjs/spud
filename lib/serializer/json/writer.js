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


proto.createReadStream = function () {
	return new ReadStream(this._data);
};




var ReadStream = function ReadStream(data) {
	Stream.call(this);
	this._data = data;
	process.nextTick(this.resume.bind(this));
};

util.inherits(ReadStream, Stream);

ReadStream.prototype.pause = function () {
	// noop
};

// WriteStream Implementation
ReadStream.prototype.resume = function () {
	// Start writing to stream
	this.emit('data', this._serialize(this._data));
	this.emit('end');
	this.emit('close');
	this._data = null;
};

ReadStream.prototype._serialize = function (data) {
	return JSON.stringify(data, null, 2);
};

