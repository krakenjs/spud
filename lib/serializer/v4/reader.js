'use strict';

var util = require('util'),
	Stream = require('stream'),
	sax = require('sax'),
	AbstractReader = require('../abstractReader');

function V4Reader() {
	V4Reader.super_.call(this);

	var parser = this._parser = sax.parser(true);
	parser.ontext = this._onText.bind(this);
	parser.onopentag = this._onOpenTag.bind(this);
	parser.onclosetag = this._onCloseTag.bind(this);

	this._init();
}

/*global exports:true*/
exports = module.exports = V4Reader;
util.inherits(V4Reader, AbstractReader);
/*global exports:false*/

var proto = V4Reader.prototype;

proto._init = function () {
	this._deserialized = {};
	this._currentNode = new Node(null, null, null, this._deserialized);
};

proto._doDeserialize = function(data, callback) {

	this._parser.onerror = function (err) {
		process.nextTick(function () {
			callback(err);
		});
		this._init();
	}.bind(this);

	this._parser.onend = function () {
		var deserialized = this._deserialized;
		process.nextTick(function () {
			callback(null, deserialized);
		});
		this._init();
	}.bind(this);

	this._parser.write(data).close();

};

proto._onText = function (text) {
	var node = this._currentNode,
		parent = null;

	if (node) {
		if (!node.data) {
			parent = node.parent;
			if (parent && parent.type === 'ContentList') {
				// This is an ugly hack for a nonsensical ContentList implementation,
				// where children ContentElements of ContentLists get this weird
				// datastructure
				parent.data.push( { '$id' : node.name, '$elt' : text } );
				delete parent.data[node.name];
			} else {
				// BASE CASE: The data/content of the element is set.
				node.data = text;
			}

		} else if (typeof node.data === 'string') {
			// Working through DPH or the like, so concat new text node.
			node.data += text;

		} else if (Array.isArray(node.data)) {
			// noop - Probably a ContentList, so just move on to descend to children
		}
	}
};

proto._onOpenTag = function (node) {
	switch (node.name) {
		case 'ContentElement':
			this._currentNode = new Node(node.attributes.id, node.name, this._currentNode);
			break;
		case 'DPH':
			this._onText('{' + node.attributes.id + '}');
			this._currentNode = new Node(node.attributes.id, node.name, this._currentNode);
			break;
		case 'ContentList':
			this._currentNode = new Node(node.attributes.id, node.name, this._currentNode, []);
			break;
		case 'ContentMap':
			this._currentNode = new Node(node.attributes.id, node.name, this._currentNode, {});
			break;
	}
};

proto._onCloseTag = function (name) {
	if (this._currentNode && this._currentNode.type === name) {
		this._currentNode = this._currentNode.parent;
	}
};


/**
 * Struct to maintain data tree relationship while iterating XML doc.
 * @param {String} name   the current node's name
 * @param {Node}   parent this node's parent node or null
 * @param {Object} data   any arbitrary data: object, string, etc.
 */
var Node = function (name, type, parent, data) {
	this._name = name;
	this._type = type;
	this._parent = parent;
	this._data = data;

	if (parent && name) {
		parent.data[name] = data;
	}
};

Node.prototype = {
	get name() {
		return this._name;
	},
	get type() {
		return this._type;
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
