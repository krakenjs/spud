'use strict';

var util = require('util'),
	Stream = require('stream'),
	AbstractReader = require('../abstractReader');

function PropertyReader() {
	PropertyReader.super_.call(this);
}

/*global exports:true*/
exports = module.exports = PropertyReader;
util.inherits(PropertyReader, AbstractReader);
/*global exports:false*/

var proto = PropertyReader.prototype;

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
	var raw = buffer.toString('utf8'),
		data = {};

	raw.split(/\r?\n/).forEach(function (line) {
		var kvp = line.match(/^([^=]+)=(.+)$/),
			key = null,
			value = null;

		if (Array.isArray(kvp) && kvp.length > 1) {
			key = kvp[1].trim();
			value = kvp[2];

			var newProp = data;
			key.split(/\./).forEach(function (prop, index, arr) {
				prop = prop.replace(/\s/g, '');

				var val = (index === arr.length - 1) ? value : (newProp[prop] || {});
				newProp = newProp[prop] = val;
			});
		}
	});

	return data;
};