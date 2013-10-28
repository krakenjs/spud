'use strict';

var helper = require('../../helpers'),
	Stream = require('stream'),
	AbstractReader = require('../abstractReader');

function PropertyReader() {

}

function  getEscapedChar(match) {
	return String.fromCharCode(parseInt(match.substring(2),16));
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
					key = key.replace(/(\\u[A-Z0-9]{4})/gi, getEscapedChar);
				}

				var tail = result;
				key.split(/\./).forEach(function (prop, index, arr) {

					// Sanitize key
					prop = prop.replace(/\s/g, '');
					// Check for array/map syntax
					//var arrMap = prop.match(/^([a-zA-Z0-9_]+)\[([a-zA-Z0-9_\[\]]*)\]$/);
					// Change to allow most any chars for name and map key
					var arrMap = prop.match(/^([^\[]+)\[(.*)\]$/);
					if ( Array.isArray(arrMap) && arrMap.length > 1 ) {
						var arrKey = arrMap[1];
						if ( arrMap[2] === '' ) {
							// Not supporting push-like syntax; Just ignore line
							// as there seems to be no diagnosing things in this code.
							// Bad syntax is just skipped over
							//tail[arrKey] = value;
						} else {
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
