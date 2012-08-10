'use strict';

var helper = require('../../helpers'),
	Stream = require('stream'),
	AbstractReader = require('../abstractReader');

function JsonReader() {

}

JsonReader.prototype = {
	/**
	 * Implementation of abstract _doDeserialize builder function.
	 * Deserializes input string into JavaScript object
	 *
	 * @override
	 * @param  {String}   data     the input string to deserialize
	 * @param  {Function} callback the callback invoked with errors or deserialized object
	 */
	_doDeserialize: function(data, callback) {
		try {
			callback(null, JSON.parse(data));
		} catch (err) {
			callback(err);
		}
	}
};


/*global exports:true*/
exports = module.exports = helper.inherits(JsonReader, AbstractReader);
/*global exports:false*/