'use strict';

var util = require('util'),
	fs = require('fs'),
	os = require('os'),
    bl = require('bl'),
	querystring = require('querystring'),
    stream = require('stream'),
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
	var readable = new stream.PassThrough();
    readable.end(querystring.stringify(data));
    return readable;
};



module.exports = {
	read: function (file, reader, callback) {
		var readStream = fs.createReadStream(file);

        readStream.on('error', callback);
        readStream.on('close', function () {
            reader.deserialize(callback);
        });

        readStream.pipe(reader);
	},

	write: function (reader, callback) {
        return reader.pipe(bl(function (err, data) {
            callback(err, data ? data.toString('utf-8') : data);
        }));
	},

	MockSerializer: {
		Reader: MockReader,
		Writer: MockWriter
	}
};

