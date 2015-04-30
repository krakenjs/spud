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

var SerializerFactory = require('./serializer/serializerFactory'),
	bl = require('bl'),
	stream = require('stream'),
	fs = require('fs'),
	path = require('path');


module.exports = {

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
	 * @param  {Object}   source	 Can be a file path, Buffer, or Stream
	 * @param  {String}   sourceType The type of input to be deserialized, e.g. 'json', 'properties'
	 * @param  {Function} callback   The callback to invoke with the serialized data or errors.
	 */
	deserialize: startDeserialize,

	/**
	 * Convert the source JavaScript Object to the desired serialized representation
	 * @param  {Object}   source		the source object
	 * @param  {String}   targetType	the resulting serialization type, e.g. 'json', 'properties'
	 * @param  {Stream}   [writeStream] Optional. The stream to which the serialized output should be written.
	 * @param  {Function} [callback]	Optional. The callback to invoke with the serialized data or errors.
	 */
	serialize: function (source, targetType, writeStream, callback) {

		var writer = SerializerFactory.buildSerializer(targetType);
		writer.data = source;
		var src = writer.createReadStream();

        // Deal with optional writeStreams and callbacks (it's kinda useless without either)
        for (var n = 2; n < arguments.length; n++) {
            handle(arguments[n]);
        }

        function handle(out) {
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

function splitError(errcb, retcb) {
	return function (err, data) {
		if (err) {
			return errcb(err);
		} else {
			return retcb(data);
		}
	};
}

function deserialize(source, sourceType, callback) {

    var deserializer;
    try {
        deserializer = SerializerFactory.buildDeserializer(sourceType);
        if (!deserializer) {
            throw new Error("Could not build deserializer for type '" + sourceType + "'");
        }
    } catch (e) {
        return callback(e);
    }


    deserializer.on('error', callback);
    deserializer.on('finish', function () {
        deserializer.deserialize(splitError(callback, function (data) {
            mergeOtherFiles(data, callback);
        }));
    });

    source.pipe(deserializer);

    function mergeOtherFiles(data, callback) {
        if (!data.include) {
            return callback(null, data);
        }
        if (!source.path) {
            return callback(new Error("Includes can only be used in streams from files"));
        }
        startDeserialize(path.resolve(path.dirname(source.path), data.include), path.extname(source.path).slice(1), splitError(callback, function (additions) {
            for (var i in additions) {
                if (!(i in data)) {
                    data[i] = additions[i];
                }
            }

            callback(null, data);
        }));
    }
}

function startDeserialize(source, sourceType, cb) {
    var callback = once(cb);
    if (!source) {
        return callback(new Error("no source to deserialize"));
    } else if (Buffer.isBuffer(source)) {
        var temp = source;
        source = new stream.PassThrough();
        source.end(temp);
    } else if (typeof source === 'string') {
        source = fs.createReadStream(source);
    }

    source.on('error', callback);

    deserialize(source, sourceType, callback);
}

function once(cb) {
    var called = false;
    return function () {
        if (!called) {
            called = true;
            return cb.apply(this, arguments);
        }
    };
}
