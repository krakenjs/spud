'use strict';

var util = require('util'),
	Stream = require('stream'),
	AbstractReader = require('../abstractReader');

function PropertyReader() {
	PropertyReader.super_.call(this);
}

/*global exports:true*/
exports = module.exports = PropertyReader;
util.inherits(PropertyReader, AbstractReader);
/*global exports:false*/

var proto = PropertyReader.prototype;

proto._doDeserialize = function(data, callback) {
	var result = {};
	
	data.split(/\r?\n/).forEach(function (line) {
		var kvp = line.match(/^(?!\s*#)([^=]+)=(.+)$/),
			key = null,
			value = null;

		if (Array.isArray(kvp) && kvp.length > 1) {
			key = kvp[1].trim();
			value = kvp[2];

			var tail = result;
			key.split(/\./).forEach(function (prop, index, arr) {

				// Sanitize key
				prop = prop.replace(/\s/g, '');

				if (index === arr.length - 1) {
					// On the final property in the namespace
					var current = tail[prop];
					if (current) {
						// This property was defined on a previous iteration...
						if (!Array.isArray(current)) {
							// but it's not an array, so we copy the orignal
							// value into a new array...
							current = tail[prop] = [current];
						}
						// ...and push the new value on the end.
						current.push(value);
					} else {
						// Property wasn't yet defined, so just set a value
						tail[prop] = value;
					}
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
};
