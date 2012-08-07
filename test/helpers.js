'use strict';

var util = require('util'),
	fs = require('fs'),
	os = require('os'),
	Stream = require('stream');



function SimpleWriter() {
	Stream.call(this);
	this._chunks = [];
	this._chunkLength = 0;
	this._data = '';
}

util.inherits(SimpleWriter, Stream);

SimpleWriter.prototype.__defineGetter__('data', function () {
	return this._data;
});

SimpleWriter.prototype.write = function (data) {
	if (Buffer.isBuffer(data)) {
		this._chunks.push(data);
		this._chunkLength += data.length;
	} else if (typeof data === 'string') {
		this._data += data;
	} else {
		this._data = data;
	}

	return true;
};

SimpleWriter.prototype.end = function () {
	if (!this._data) {
		this._data = Buffer.concat(this._chunks, this._chunkLength).toString('utf8');
	}
};



module.exports = {
	read: function (file, reader, callback) {

		var readStream = fs.createReadStream(file);
		util.pump(readStream, reader, function (err) {
			if (err) {
				callback(err);
				return;
			}
			
			reader.deserialize(callback);
		});

	},

	write: function (reader, callback) {
		var writer = new SimpleWriter();
		util.pump(reader, writer, function (err) {
			callback(err, writer.data);
		});
	}
};