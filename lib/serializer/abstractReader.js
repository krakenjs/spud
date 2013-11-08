/***@@@ BEGIN LICENSE @@@***
Copyright (c) 2013, eBay Software Foundation All rights reserved.  Use of the accompanying software, in source and binary forms, is permitted without modification only and provided that the following conditions are met:  Use of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  Use in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  Neither the name of eBay or its subsidiaries nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  All rights not expressly granted to the recipient in this license are reserved by the copyright holder.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
***@@@ END LICENSE @@@***/

'use strict';

var util = require('util'),
	WriteStream = require('../writeStream');


function AbstractReader() {
	AbstractReader.super_.call(this);
}

/*global exports:true*/
exports = module.exports = AbstractReader;
util.inherits(AbstractReader, WriteStream);
/*global exports:false*/

var proto = AbstractReader.prototype;

proto.__defineSetter__('data', function (value) {
	this._data = value;
});

/**
 * Public API for invoking serialization on steramed in data
 * @param  {Function} callback the callback to invoke with the err or deserialized data details
 */
proto.deserialize = function (callback) {
	this._doDeserialize(this._data.toString('utf8'), callback);
};

/**
 * Abstract method to be overridden by implementing classes
 * @param  {String}   data     the string data to deserialize
 * @param  {Function} callback the callback to invoke with error or deserialized data
 */
proto._doDeserialize = function (data, callback) {
	throw new Error('Not implemented');
};
