/***@@@ BEGIN LICENSE @@@***
Copyright (c) 2013, eBay Software Foundation All rights reserved.  Use of the accompanying software, in source and binary forms, is permitted without modification only and provided that the following conditions are met:  Use of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  Use in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  Neither the name of eBay or its subsidiaries nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  All rights not expressly granted to the recipient in this license are reserved by the copyright holder.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
***@@@ END LICENSE @@@***/
'use strict';

var util = require('util');

/**
 * Combines objects in reverse order of provided arguments. The right-most
 * object's properties are copied to the left, and so on.
 * @param  {Object} dest the destination object
 * @return {Object}      the destination object
 */
function mixin(dest) {
	Array.prototype.slice.call(arguments, 1).forEach(function (src) {
		Object.keys(src).forEach(function (prop) {
			var descriptor = Object.getOwnPropertyDescriptor(src, prop);
			Object.defineProperty(dest, prop, descriptor);
		});
	});
	return dest;
}

/**
 * Handles the boilerplate code associated with using
 * util#inherits in NodeJS. The subclass implementation can
 * either be on the prototype of the subclass constructor
 * or provided via the optional impl parameter.
 * @param  {Function} ctor      The subclass constructor
 * @param  {Function} superCtor The superclass constructor
 * @return {Function}           The contructor appropriately inherited
 */
function inherits(ctor, superCtor) {
	// Custom proxy constructor
	function Clazz() {
		superCtor.apply(this, arguments);
		ctor.apply(this, arguments);
	}

	// Hang on to the original subclass prototype so it doesn't get lost
	var proto = ctor.prototype;

	// Inherit as usual (overwrites the subclass prototype and adds super_)
	util.inherits(ctor, superCtor);

	// Ensure the proxy constructor is a good likeness
	Clazz.super_ = ctor.super_;
	Clazz.name_ = ctor.name;

	// Fake out the prototype chain
	Clazz.prototype.constructor.prototype = ctor.prototype;

	// Merge the prototype definition from the subclass
	mixin(Clazz.prototype, proto);

	// Return the proxy constructor
	return Clazz;
}


/*globals exports:true*/
exports = module.exports = {
	mixin: mixin,
	inherits: inherits
};
/*globals exports:false*/