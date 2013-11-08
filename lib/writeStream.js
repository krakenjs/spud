/***@@@ BEGIN LICENSE @@@***
Copyright (c) 2013, eBay Software Foundation All rights reserved.  Use of the accompanying software, in source and binary forms, is permitted without modification only and provided that the following conditions are met:  Use of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  Use in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  Neither the name of eBay or its subsidiaries nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  All rights not expressly granted to the recipient in this license are reserved by the copyright holder.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
***@@@ END LICENSE @@@***/

'use strict';

var util = require('util'),
	Stream = require('stream');

var WriteStream = function (stream) {
	WriteStream.super_.call(this);
	this._wrapped = stream;
	this._data = null;
	this._chunks = [];
	this._chunkLength = 0;
};

util.inherits(WriteStream, Stream);

WriteStream.prototype.__defineGetter__('data', function () {
	return this._data;
});

WriteStream.prototype.write = function (chunk) {
	if (typeof chunk === 'string') {
		chunk = new Buffer(chunk);
	}

	this._chunks.push(chunk);
	this._chunkLength += chunk.length;

	return this._proxy('write', arguments) || true;
};

WriteStream.prototype.end = function () {
	this._data = Buffer.concat(this._chunks, this._chunkLength);
	this._proxy('end', arguments);
};

WriteStream.prototype.destroy = function () {
	this._proxy('destroy', arguments);
};

WriteStream.prototype.destroySoon = function () {
	this._proxy('destroySoon', arguments);
};

WriteStream.prototype._proxy = function(method, args) {
	var stream = this._wrapped;
	if (stream) {
		return stream[method].apply(stream, args);
	}
};

/*global exports:true*/
exports = module.exports = WriteStream;
/*global exports:false*/