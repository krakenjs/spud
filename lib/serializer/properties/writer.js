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

function default_proccessKeyValue( namespace, item, state ) {
	return { kvp: { key: namespace, value: item }, state: state };
}
function default_getStartState() {
	return { "__prepend__": null, "__append__": null };
}

function PropertyWriter(options) {
	PropertyWriter.super_.call(this);

	this.options = options || {};
	if ( ! this.options.processKeyValue ) {
		this.options.processKeyValue = default_proccessKeyValue;
	}
	if ( ! this.options.getStartState ) {
		this.options.getStartState = default_getStartState;
	}
}

util.inherits(PropertyWriter, AbstractWriter);

PropertyWriter.prototype._doCreateReadStream = function(data) {
	return new ReadStream(data, this.options);
};


function ReadStream(data, options) {
	ReadStream.super_.call(this);
	this._data = data;
	this.options = options;
}

util.inherits(ReadStream, stream.Readable);

ReadStream.prototype._read = function (size) {
	this._process( null, this._data, this.options.getStartState() );
	this.push(null);
};

ReadStream.prototype._process = function (namespace, data, state) {

	// TODO: Some more work in this direction to make it
	// super fast, if necessary.

	var processed = this.options.processKeyValue( namespace, data, state );
	state = processed.state;
	namespace = processed.kvp.key;
	data = processed.kvp.value;

	switch (typeof data) {
		case 'object':
			if (Array.isArray(data)) {
				data.forEach(function (item) {
					state = this._process(namespace, item, state);
				}.bind(this));
			} else if (data === null) {
				state = this._process(namespace, String(data), state);
				break;
			} else {
				Object.keys(data).forEach(function (key) {
					var name = namespace ? namespace + '.' + key : key;
					state = this._process(name, data[key], state);
				}.bind(this));
			}
			break;

		case 'number':
			state = this._process(namespace, Number.isFinite(data) ? String(data) : '', state);
			break;

		case 'boolean':
			state = this._process(namespace, String(data), state);
			break;

		case 'string':
			if ( state.__prepend__ ) {
				this.push( state.__prepend__ + os.EOL );
			}
			state.__prepend__ = null;

			var value = [namespace, '=', data, os.EOL].join('');
			this.push(value);

			if ( state.__append__ ) {
				this.push( state.__append__ + os.EOL );
			}
			state.__append__ = null;

			break;

		default:
			console.warn('Unserializable value:', data);
	}

	return state;
};

module.exports = PropertyWriter;
