/***@@@ BEGIN LICENSE @@@***
Copyright (c) 2013, eBay Software Foundation All rights reserved.  Use of the accompanying software, in source and binary forms, is permitted without modification only and provided that the following conditions are met:  Use of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  Use in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  Neither the name of eBay or its subsidiaries nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  All rights not expressly granted to the recipient in this license are reserved by the copyright holder.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
***@@@ END LICENSE @@@***/

/*global exports:true*/

'use strict';

var SerializerFactory = require('./serializer/serializerFactory'),
	WriteStream = require('./writeStream'),
	inputChain = require('./inputChain'),
	helper = require('./helpers'),
	util = require('util'),
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
		if (!(serializer.Reader instanceof this.AbstractReader)) {
			serializer.Reader = helper.inherits(serializer.Reader, this.AbstractReader);
		}

		if (!(serializer.Writer instanceof this.AbstractWriter)) {
			serializer.Writer = helper.inherits(serializer.Writer, this.AbstractWriter);
		}

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

		// Deal with optional writeStreams and callbacks (it's kinda useless without either)
		if (typeof writeStream === 'function') {
			callback = writeStream;
			writeStream = null;
		}

		// Proxy the writeStream (or lack thereof) to always get access to the serialized data
		writeStream = new WriteStream(writeStream);
		callback = callback || function () {};

		var writer = SerializerFactory.buildSerializer(targetType);
		writer.data = source;

        var src = writer.createReadStream();
        src.on('data', writeStream.write.bind(writeStream));
        src.on('error', callback);
        src.on('close', function () {
            callback(null, writeStream.data.toString('utf8'));
        });

        // Stream the serialized data to the file write stream
        src.pipe(writeStream);
	}

};
