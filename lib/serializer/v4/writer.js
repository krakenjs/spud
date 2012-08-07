'use strict';

var util = require('util'),
	AbstractWriter = require('../abstractWriter');

function V4Writer() {
	V4Writer.super_.call(this);
}

/*global exports:true*/
exports = module.exports = V4Writer;
util.inherits(V4Writer, AbstractWriter);
/*global exports:false*/

this._doCreateReadStream = function () {
	throw new Error('V4 .4cb generation not supported.');
};