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
	stream = require('stream'),
	AbstractWriter = require('../abstractWriter');

function JsonWriter() {
	JsonWriter.super_.call(this);
}

util.inherits(JsonWriter, AbstractWriter);

/**
 * The implementation of the Stream that serializes the provided Object into a string
 * @override
 * @return {Stream} the Read Stream
 */
JsonWriter.prototype._doCreateReadStream = function (data) {
	var out = new stream.PassThrough();
	out.end(JSON.stringify(data, null, 2));
	return out;
};

module.exports = JsonWriter;
