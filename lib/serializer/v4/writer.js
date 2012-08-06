var util = require('util'),
	AbstractWriter = require('../abstractWriter');

function V4Writer() {

}

/*global exports:true*/
exports = module.exports = V4Writer;
util.inherits(V4Writer, AbstractWriter);
/*global exports:false*/