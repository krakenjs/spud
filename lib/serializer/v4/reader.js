'use strict';

var util = require('util'),
	Stream = require('stream'),
	sax = require('sax'),
	AbstractReader = require('../abstractReader');

function V4Reader() {
	V4Reader.super_.call(this);
}

/*global exports:true*/
exports = module.exports = V4Reader;
util.inherits(V4Reader, AbstractReader);
/*global exports:false*/

var proto = V4Reader.prototype;

proto.createReadStream = function() {
	return new ReadStream(this._data);
};


var Node = function (name, parent, data) {
	this._name = name;
	this._parent = parent;
	this._data = data;

	if (parent) {
		parent.data[name] = data;
	}
};

Node.prototype = {
	get name() {
		return this._name;
	},
	get parent() {
		return this._parent;
	},
	get data() {
		return this._data;
	},
	set data(value) {
		this._data = value;
		if (this._parent) {
			this._parent.data[this._name] = value;
		}
	}
};



var ReadStream = function ReadStream(data) {
	Stream.call(this);
	this._data = data;

	this._deserialized = {};
	this._currentNode = new Node(null, null, this._deserialized);

	var parser = this._parser = sax.parser(true);
	parser.onerror = this._onError.bind(this);
	parser.ontext = this._onText.bind(this);
	parser.onopentag = this._onOpenTag.bind(this);
	parser.onclosetag = this._onCloseTag.bind(this);
	parser.onend = this._onEnd.bind(this);

	process.nextTick(this.resume.bind(this));
};

util.inherits(ReadStream, Stream);

ReadStream.prototype.resume = function () {
	this._parser.write(this._data.toString('utf8')).close();
};

ReadStream.prototype._onError = function (err) {
	this.emit('error', err);
	this.emit('close');
	this._data = null;
	this._deserialized = {};
};

ReadStream.prototype._onText = function (text) {
	if (this._currentNode) {
		if (!this._currentNode.data) {
			this._currentNode.data = text;
		} else if (typeof this._currentNode.data === 'string') {
			this._currentNode.data += text;
		}
	}
};

ReadStream.prototype._onOpenTag = function (node) {
	switch (node.name) {
		case 'ContentElement':
			this._currentNode = new Node(node.attributes.id, this._currentNode);
			break;
		case 'DPH':
			this._onText('%' + node.attributes.id + '%');
			this._currentNode = new Node(node.attributes.id, this._currentNode);
			break;
		case 'ContentList':
			this._currentNode = new Node(node.attributes.id, this._currentNode, {});
			this._currentNode.data = {};
			break;
	}
};

ReadStream.prototype._onCloseTag = function () {
	if (this._currentNode) {
		this._currentNode = this._currentNode.parent;
	}
};

ReadStream.prototype._onEnd = function () {
	this.emit('data', this._deserialized);
	this.emit('end');
	this.emit('close');
	this._data = null;
	this._deserialized = {};
};