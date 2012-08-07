/*global describe:false, it:false, before:false, beforeEach:false*/

'use strict';

var should = require('should'),
	helpers = require('./helpers'),
	V4Serializer = require('../lib/serializer/v4');


describe('v4Reader', function () {

	it('should read keys and values correctly', function (next) {
		var reader = new V4Serializer.Reader();
		helpers.read('./test/v4/locales/us-EN/keyValueTest.4cb', reader, function (err, data) {
			should.not.exist(err);
			should.exist(data);

			should.equal(data.keyValueTest1, 'My Value 1');
			should.equal(data.keyValueTest2, ' My Value 2');
			should.equal(data.keyValueTest3, 'My Value 3 ');
			should.equal(data.keyValueTest4, ' My Value 4 ');

			next();
		});
	});



	it('should convert namespaced keys and values to the correct object structure', function (next) {

		var reader = new V4Serializer.Reader();
		helpers.read('./test/v4/locales/us-EN/mapTest.4cb', reader, function (err, data) {
			should.not.exist(err);
			should.exist(data);

			should.equal(data.objectTest1.key1, 'My Value 1');
			should.equal(data.objectTest1.key2, 'My Value 2');

			should.equal(data.objectTest2.key1, 'My Value 1');
			should.equal(data.objectTest2.key2.key1, 'My Value 2');
			should.equal(data.objectTest2.key3.key2.key1, 'My Value 3');
			should.equal(data.objectTest2.key4.key3.key2.key1, 'My Value 4');

			next();
		});

	});

});

describe('v4Writer', function () {

	//var writer = new v4Serializer.Writer();

});