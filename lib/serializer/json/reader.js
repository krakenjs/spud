'use strict';

var util = require('util'),
	Stream = require('stream'),
	AbstractReader = require('../abstractReader');

function JsonReader() {
	JsonReader.super_.call(this);
}

/*global exports:true*/
exports = module.exports = JsonReader;
util.inherits(JsonReader, AbstractReader);
/*global exports:false*/

var proto = JsonReader.prototype;

proto.createReadStream = function() {
	return new ReadStream(this._data);
};




var ReadStream = function ReadStream(data) {
	Stream.call(this);
	this._data = data;
	process.nextTick(this.resume.bind(this));
};

util.inherits(ReadStream, Stream);

ReadStream.prototype.resume = function () {
	// Write to stream
	this.emit('data', this._deserialize(this._data));
	this.emit('end');
	this.emit('close');
	this._data = null;
};

ReadStream.prototype._deserialize = function (buffer) {
	return JSON.parse(buffer.toString('utf8'));
};