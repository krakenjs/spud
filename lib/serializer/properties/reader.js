/***@@@ BEGIN LICENSE @@@***
Copyright (c) 2013, eBay Software Foundation All rights reserved.  Use of the accompanying software, in source and binary forms, is permitted without modification only and provided that the following conditions are met:  Use of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  Use in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  Neither the name of eBay or its subsidiaries nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  All rights not expressly granted to the recipient in this license are reserved by the copyright holder.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
***@@@ END LICENSE @@@***/

'use strict';

var helper = require('../../helpers'),
	Stream = require('stream'),
	codePointAt = require('string.fromcodepoint'),
	AbstractReader = require('../abstractReader');

function PropertyReader() {

}

function  getEscapedChar(match) {
	match = match.substring(2).replace(/[\{\}]/g, '');
	return String.fromCodePoint(parseInt(match, 16));
}

PropertyReader.prototype = {

	_doDeserialize: function(data, callback) {
		var result = {};

		data.split(/\r?\n/).forEach(function (line) {
			var kvp = line.match(/^(?!\s*#)([^=]+)=(.+)$/),
				key = null,
				value = null;

			if (Array.isArray(kvp) && kvp.length > 1) {
				key = kvp[1].trim();
				value = kvp[2];
				if (key.indexOf('\\u') !== -1) {
					//ES6 format: \u{xxxxxx}
					if(key.indexOf('\\u\{') !== -1) {
						key = key.replace(/(\\u\{[A-Z0-9]{1,6}})/gi, getEscapedChar);
					} else {
						key = key.replace(/(\\u[A-Z0-9]{4})/gi, getEscapedChar);
					}
				}

				var tail = result;
				key.split(/\./).forEach(function (prop, index, arr) {

					// Sanitize key
					prop = prop.replace(/\s/g, '');
					// Change to allow most any chars for name and map key
					var arrMap = prop.match(/^([^\[]+)\[(.*)\]$/);
					if ( Array.isArray(arrMap) && arrMap.length > 1 ) {
						var arrKey = arrMap[1];
						if ( arrMap[2] !== '' ) {
							// If previous value is present for this key, use it, otherwise new object
							arrMap[2].split(/\]\[/).forEach(function (arrProp, arrIndex, subArr) {
								// Iterate over the property keys
								if ( arrProp.match(/^[0-9]+$/) ) {
									if ( arrIndex === 0 ) {
										tail = tail[arrKey] = (typeof tail[arrKey] !== 'undefined' && typeof tail[arrKey] === 'object') ? tail[arrKey] : [];
									}
									// Assign the value if it's the last key in the set
									tail[arrProp] = ( arrIndex === subArr.length - 1 ) ? value : tail[arrProp] || [];
								} else {
									if ( arrIndex === 0 ) {
										tail = tail[arrKey] = (typeof tail[arrKey] !== 'undefined' && typeof tail[arrKey] === 'object') ? tail[arrKey] : {};
									}
									// Assign the value if it's the last key in the set
									tail[arrProp] = ( arrIndex === subArr.length - 1 ) ? value : tail[arrProp] || {};
								}
								tail = tail[arrProp];
							});
						}
					} else if (index === arr.length - 1) {
						// On the final property in the namespace
						// Property wasn't yet defined, so just set a value
						tail[prop] = value;
					} else {
						// Continue through the namespace. If a property
						// was defined in a previous iteration, use it,
						// otherwise, create an empty object and move on.
						tail = tail[prop] = (tail[prop] || {});
					}
				});
			}
		});
		callback(null, result);
	}

};



/*global exports:true*/
exports = module.exports = helper.inherits(PropertyReader, AbstractReader);
/*global exports:false*/
