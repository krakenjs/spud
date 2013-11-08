/***@@@ BEGIN LICENSE @@@***
Copyright (c) 2013, eBay Software Foundation All rights reserved.  Use of the accompanying software, in source and binary forms, is permitted without modification only and provided that the following conditions are met:  Use of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  Use in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  Neither the name of eBay or its subsidiaries nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  All rights not expressly granted to the recipient in this license are reserved by the copyright holder.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
***@@@ END LICENSE @@@***/

'use strict';

var SerializerFactory = require('./serializer/serializerFactory'),
	Stream = require('stream'),
	util = require('util'),
	fs = require('fs');


// Abstract Base class for each link in the chain - Chain of Responsibility Pattern
var Link = function (next) {
	this._next = next;
};

Link.prototype = {

	_canHandle: function (source) {
		return false;
	},

	_doExecute: function(source, sourceType, callback) {
		callback(new Error('not implemented'));
	},

	execute: function (source, sourceType, callback) {
		if (this._canHandle(source)) {
			this._doExecute(source, sourceType, callback);
		} else if (this._next) {
			this._next.execute(source, sourceType, callback);
		} else {
			throw new Error('Unrecognized input format.');
		}
	}

};




var BufferSource = function () {
	BufferSource.super_.apply(this, arguments);
};

util.inherits(BufferSource, Link);

BufferSource.prototype._canHandle = function (source) {
	return Buffer.isBuffer(source);
};

BufferSource.prototype._doExecute = function (source, sourceType, callback) {
	var deserializer = SerializerFactory.buildDeserializer(sourceType);
	deserializer.write(source);
	deserializer.end();
	deserializer.deserialize(callback);
};




var StreamSource = function () {
	StreamSource.super_.apply(this, arguments);
};

util.inherits(StreamSource, Link);

StreamSource.prototype._canHandle = function (source) {
	return source instanceof Stream;
};

StreamSource.prototype._doExecute = function (source, sourceType, callback) {
	var deserializer = SerializerFactory.buildDeserializer(sourceType);

    source.on('error', callback);
    source.on('close', function () {
        deserializer.deserialize(callback);
    });

    source.pipe(deserializer);
};




var FileSource = function () {
	FileSource.super_.apply(this, arguments);
};

util.inherits(FileSource, StreamSource);

FileSource.prototype._canHandle = function (source) {
	return typeof source === 'string';
};

FileSource.prototype._doExecute = function (source, sourceType, callback) {
	fs.exists(source, function (exists) {
		if (!exists) {
			callback(new Error('Source file not found: ' + source));
			return;
		}
		FileSource.super_.prototype._doExecute.apply(this, [fs.createReadStream(source), sourceType, callback]);
	});
};




/*global exports:true*/

// Build chain
exports = module.exports = new BufferSource(new StreamSource(new FileSource()));

/*global exports:false*/