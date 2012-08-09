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
 * @param  {Object}   [impl]    Optional. The subclass implementation.
 * @return {Function}           The contructor appropriately inherited
 */
function inherits(ctor, superCtor, impl) {
	function Clazz() {
		superCtor.apply(this, arguments);
		ctor.apply(this, arguments);
	}

	util.inherits(Clazz, superCtor);
	mixin(Clazz.prototype, impl || ctor.prototype);
	return Clazz;
}


/*globals exports:true*/
exports = module.exports = {
	mixin: mixin,
	inherits: inherits
};
/*globals exports:false*/