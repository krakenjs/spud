'use strict';

var util = require('util'),
	Stream = require('stream'),
	AbstractReader = require('../abstractReader');

function JsonReader() {
	JsonReader.super_.call(this);
}

/*global exports:true*/
exports = module.exports = JsonReader;
util.inherits(JsonReader, AbstractReader);
/*global exports:false*/

var proto = JsonReader.prototype;

/**
 * Implementation of abstract _doDeserialize builder function.
 * Deserializes input string into JavaScript object
 * 
 * @override
 * @param  {String}   data     the input string to deserialize
 * @param  {Function} callback the callback invoked with errors or deserialized object
 */
proto._doDeserialize = function(data, callback) {
	try {
		callback(null, JSON.parse(data));
	} catch (err) {
		callback(err);
	}
};