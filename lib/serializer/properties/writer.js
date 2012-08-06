'use strict';

var os = require('os'),
	util = require('util'),
	Stream = require('stream'),
	AbstractWriter = require('../abstractWriter');

function PropertyWriter() {
	PropertyWriter.super_.call(this);
}

/*global exports:true*/
exports = module.exports = PropertyWriter;
util.inherits(PropertyWriter, AbstractWriter);
/*global exports:false*/

var proto = PropertyWriter.prototype;

proto.createReadStream = function() {
	return new ReadStream(this._data);
};




var ReadStream = function ReadStream(data) {
	Stream.call(this);
	this._data = data;
	this._buffer = [];
	this._remaining = 0;
	this._paused = true;
	process.nextTick(this.resume.bind(this));
};

util.inherits(ReadStream, Stream);

ReadStream.prototype.pause = function () {
	this._paused = true;
};

ReadStream.prototype.drain = function () {
	this.resume();
};

ReadStream.prototype.resume = function () {
	this._paused = false;

	// Start writing to stream
	if (this._data) {
		this._read(null, this._data);
		this._remaining = this._buffer.length;
	}

	// Work through buffer to process
	this._buffer.splice(0).forEach(function (entry) {
		process.nextTick(function () {
			if (this._paused) {
				this._buffer.push(entry);
			} else {
				this.emit('data', entry);
				this._remaining -= 1;
				if (!this._remaining) {
					this.emit('end');
					this.emit('close');
					this._data = null;
				}
			}
		}.bind(this));
	}.bind(this));

};

ReadStream.prototype.destroy = function () {
	this._buffer = null;
	this._data = null;
	this.emit('close');
};

ReadStream.prototype._read = function (namespace, data) {

	Object.keys(data).forEach(function (prop) {

		var name = (namespace ? namespace + '.' : '' ) + prop,
			value = data[prop];

		switch (typeof value) {
			case 'object':
				if (Array.isArray(value)) {
					value = value.join(',');
				} else {
					this._read(name, value);
					if (!namespace) {
						this._data = null;
					}
					break;
				}
			case 'number':
				value = Number.isFinite(value) ? value : '';

			case 'boolean':
			case 'null':
				value = String(value);

			case 'string':
				this._buffer.push([name, value].join('=') + os.EOL);
				break;

			default:
				console.log('Unserializable value.');
				break;
		}

	}.bind(this));

};