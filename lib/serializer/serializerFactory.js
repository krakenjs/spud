/*global exports:true*/

'use strict';

exports = module.exports = {

	_cache: {},

	_getLibForType: function (type) {
		var clazz = this._cache[type];
		if (!clazz) {
			clazz = this._cache[type] = require('./' + type);
		}
		return clazz;
	},

	buildDeserializer: function (type) {
		var Clazz = this._getLibForType(type).Reader;
		return new Clazz();
	},

	buildSerializer: function (type) {
		var Clazz = this._getLibForType(type).Writer;
		return new Clazz();
	},

	register: function (type, serializer) {
		var previous = this._cache[type];
		this._cache[type] = serializer;
		return previous;
	}

};