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

var os = require('os'),
	util = require('util'),
	stream = require('stream'),
	AbstractWriter = require('../abstractWriter');

function PropertyWriter() {
	PropertyWriter.super_.call(this);
}

util.inherits(PropertyWriter, AbstractWriter);

PropertyWriter.prototype._doCreateReadStream = function(data) {
	return new ReadStream(data);
};


function ReadStream(data) {
	ReadStream.super_.call(this);
	this._data = data;
}

util.inherits(ReadStream, stream.Readable);

ReadStream.prototype._read = function (size) {
	this._process(null, this._data);
	this.push(null);
};

ReadStream.prototype._process = function (namespace, data) {

	// TODO: Some more work in this direction to make it
	// super fast, if necessary.

	switch (typeof data) {
		case 'object':
			if (Array.isArray(data)) {
				data.forEach(function (item) {
					this._process(namespace, item);
				}.bind(this));
			} else if (data === null) {
				this._process(namespace, String(data));
				break;
			} else {
				Object.keys(data).forEach(function (key) {
					var name = namespace ? namespace + '.' + key : key;
					this._process(name, data[key]);
				}.bind(this));
			}
			break;

		case 'number':
			this._process(namespace, Number.isFinite(data) ? String(data) : '');
			break;

		case 'boolean':
			this._process(namespace, String(data));
			break;

		case 'string':
			var value = [namespace, '=', data, os.EOL].join('');
			this.push(value);
			break;

		default:
			console.warn('Unserializable value:', data);
	}
};

module.exports = PropertyWriter;
