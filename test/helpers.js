'use strict';

var util = require('util'),
	fs = require('fs'),
	os = require('os'),
	querystring = require('querystring'),
	Stream = require('stream'),
	WriteStream = require('../lib/writeStream'),
	Transcoder = require('../index');



var MockReader = function () {
	MockReader.super_.call(this);
};
util.inherits(MockReader, Transcoder.AbstractReader);

MockReader.prototype._doDeserialize = function(data, callback) {
	try {
		callback(null, querystring.parse(data));
	} catch (err) {
		callback(err);
	}
};



var MockWriter = function () {
	MockWriter.super_.call(this);
};
util.inherits(MockWriter, Transcoder.AbstractWriter);

MockWriter.prototype._doCreateReadStream = function (data) {
	var stream = new Stream();
	stream.resume = function () {
		this.emit('data', querystring.stringify(data));
		this.emit('end');
		this.emit('close');
	};
	return stream;
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
		var writer = new WriteStream();
		util.pump(reader, writer, function (err) {
			callback(err, writer.data.toString('utf8'));
		});
	},

	MockSerializer: {
		Reader: MockReader,
		Writer: MockWriter
	}
};

