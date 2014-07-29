/***@@@ BEGIN LICENSE @@@***/
/*───────────────────────────────────────────────────────────────────────────*\
│  Copyright (C) 2013 eBay Software Foundation                                │
│                                                                             │
│hh ,'""`.                                                                    │
│  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
│  |(@)(@)|  you may not use this file except in compliance with the License. │
│  )  __  (  You may obtain a copy of the License at                          │
│ /,'))((`.\                                                                  │
│(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
│ `\ `)(' /'                                                                  │
│                                                                             │
│   Unless required by applicable law or agreed to in writing, software       │
│   distributed under the License is distributed on an "AS IS" BASIS,         │
│   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
│   See the License for the specific language governing permissions and       │
│   limitations under the License.                                            │
\*───────────────────────────────────────────────────────────────────────────*/
/***@@@ END LICENSE @@@***/

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

