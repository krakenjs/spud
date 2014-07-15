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

/*global exports:true*/

'use strict';

var SerializerFactory = require('./serializer/serializerFactory'),
	WriteStream = require('./writeStream'),
	inputChain = require('./inputChain'),
	util = require('util'),
    bl = require('bl'),
	fs = require('fs');


exports = module.exports = {

	AbstractReader: require('./serializer/abstractReader'),

	AbstractWriter: require('./serializer/abstractWriter'),

	/**
	 * Register a custom serializer
	 * @param  {String} name       the name of the type the serializer supports, e.g. 'josn', 'properties', etc.
	 * @param  {Object} serializer the serializer implementation
	 * @return {Object}            the previous serializer associated with the key, or null if none.
	 */
	registerSerializer: function (type, serializer) {
		return SerializerFactory.register(type, serializer);
	},

	/**
	 * Deserialize an input of type sourceType and serialize it to target type
	 * @param  {Object}   source        Can be a file path, Buffer, or Stream
	 * @param  {String}   sourceType    The type of input to be deserialized, e.g. 'json', 'properties'
	 * @param  {String}   targetType    The type of output to produce, e.g. 'json', 'properties'
	 * @param  {Stream}   [writeStream] Optional. The stream to which the serialized output should be written.
	 * @param  {Function} [callback]    Optional. The callback to invoke with the serialized data or errors.
	 */
	convert: function (source, sourceType, targetType, writeStream, callback) {

		this.deserialize(source, sourceType, function (err, data) {
			if (err) {
				callback(err);
				return;
			}

			// Hand off the deserialized data to be serialized, (reusing readStream.)
			this.serialize(data, targetType, writeStream, callback);
		}.bind(this));

	},


	/**
	 * Convert the source data to a JavaScript Object
	 * @param  {Object}   source     Can be a file path, Buffer, or Stream
	 * @param  {String}   sourceType The type of input to be deserialized, e.g. 'json', 'properties'
	 * @param  {Function} callback   The callback to invoke with the serialized data or errors.
	 */
	deserialize: function (source, sourceType, callback) {
		inputChain.execute(source, sourceType, callback);
	},


	/**
	 * Convert the source JavaScript Object to the desired serialized representation
	 * @param  {Object}   source        the source object
	 * @param  {String}   targetType    the resulting serialization type, e.g. 'json', 'properties'
	 * @param  {Stream}   [writeStream] Optional. The stream to which the serialized output should be written.
	 * @param  {Function} [callback]    Optional. The callback to invoke with the serialized data or errors.
	 */
	serialize: function (source, targetType, writeStream, callback) {

		var writer = SerializerFactory.buildSerializer(targetType);
		writer.data = source;
        var src = writer.createReadStream();

        // Deal with optional writeStreams and callbacks (it's kinda useless without either)
        for (var n = 2; n < arguments.length; n++) {
            handle(arguments[n], n);
        }

        function handle(out, n) {
            if (typeof out === 'function') {
                src.pipe(bl(function (err, data) {
                    out(err, data ? data.toString('utf-8') : data);
                }));
            } else if (out) {
                src.pipe(out);
            } else {
                // Skip undefined arguments
            }
		}
	}

};
