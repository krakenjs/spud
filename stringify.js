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
	util = require('util');


function stringify(obj) {
    if (typeof obj !== 'object') {
        throw new Error("Can only stringify an object");
    }

    return Object.keys(obj).map(function (k) { 
        return el(k, obj[k]);
    }).join('');

    function el(namespace, data) {

        // TODO: Some more work in this direction to make it
        // super fast, if necessary.

        switch (typeof data) {
            case 'object':
                if (Array.isArray(data)) {
                    return data.map(function (item) {
                        return el(namespace, item);
                    }).join('');
                } else {
                    return Object.keys(data).map(function (key) {
                        var name = namespace ? namespace + '.' + key : key;
                        return el(name, data[key]);
                    }).join('');
                }
                break;

            case 'number':
                return el(namespace, Number.isFinite(data) ? String(data) : '');

            case 'boolean':
                return el(namespace, String(data));

            case 'null':
                return el(namespace, String(data));

            case 'string':
                return [namespace, '=', data, os.EOL].join('');

            default:
                throw new Error('Unserializable value: ' + data);
        }
    }
}

module.exports = stringify;
