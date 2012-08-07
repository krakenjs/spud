/*global describe:false, it:false, before:false, beforeEach:false*/

'use strict';

var should = require('should'),
	util = require('util'),
	os = require('os'),
	helpers = require('./helpers'),
	PropertySerializer = require('../lib/serializer/properties');


describe('PropertyReader', function () {

	it('should read keys and values correctly', function (next) {

		var reader = new PropertySerializer.Reader();
		helpers.read('./test/properties/locales/us-EN/keyValueTest.properties', reader, function (err, data) {
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

		var reader = new PropertySerializer.Reader();
		helpers.read('./test/properties/locales/us-EN/mapTest.properties', reader, function (err, data) {
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



	it('should convert identically named properties to a JSON string array', function (next) {

		var reader = new PropertySerializer.Reader();
		helpers.read('./test/properties/locales/us-EN/arrayTest.properties', reader, function (err, data) {
			should.not.exist(err);
			should.exist(data);

			Array.isArray(data.arrayTest2).should.be.true;
			data.arrayTest2.length.should.equal(3);

			Array.isArray(data.arrayTest3.key1).should.be.true;
			data.arrayTest3.key1.length.should.equal(3);

			Array.isArray(data.arrayTest4.a.key1).should.be.true;
			data.arrayTest4.a.key1.length.should.equal(3);

			Array.isArray(data.arrayTest4.b.key1).should.be.true;
			data.arrayTest4.b.key1.length.should.equal(3);

			Array.isArray(data.arrayTest5.a.key1).should.be.true;
			data.arrayTest5.a.key1.length.should.equal(3);

			Array.isArray(data.arrayTest5.b).should.be.true;
			data.arrayTest5.b.length.should.equal(3);

			'test foo'.should.equal(data.arrayTest5.c.key1);

			next();
		});

	});

});

describe('PropertyWriter', function () {

	it('should convert a simple object to a simple property list', function (next) {
		var writer = new PropertySerializer.Writer();
		writer.data = {
			'keyValueTest1': 'My Value 1',
			'keyValueTest2': ' My Value 2'
		};

		helpers.write(writer.createReadStream(), function (err, data) {
			should.not.exist(err);
			should.exist(data);

			data.should.equal( ['keyValueTest1=My Value 1', 'keyValueTest2= My Value 2', ''].join(os.EOL) );
			next();
		});
	});



	it('shoud convert a compound object to namespaced keys and values', function (next) {
		var writer = new PropertySerializer.Writer();
		writer.data = {
			objectTest2: {
				key1: 'My Value 1',
				key2: { key1: 'My Value 2' }
			}
		};

		helpers.write(writer.createReadStream(), function (err, data) {
			should.not.exist(err);
			should.exist(data);

			data.should.equal( ['objectTest2.key1=My Value 1', 'objectTest2.key2.key1=My Value 2', ''].join(os.EOL) );
			next();
		});

	});



	it('should convert an array to identically named keys', function (next) {
		var writer = new PropertySerializer.Writer();
		writer.data = {
			arrayTest2: [ 'value1', 'value2', 'value3' ]
		};

		helpers.write(writer.createReadStream(), function (err, data) {
			should.not.exist(err);
			should.exist(data);

			data.should.equal( ['arrayTest2=value1', 'arrayTest2=value2', 'arrayTest2=value3', ''].join(os.EOL) );
			next();
		});
	});



	it('should convert an array in a compound object to namespaced keys and array values', function (next) {
		var writer = new PropertySerializer.Writer();
		writer.data = {
			arrayTest3: {
				key1: [ 'value1', 'value2', 'value3' ]
			}
		};

		helpers.write(writer.createReadStream(), function (err, data) {
			should.not.exist(err);
			should.exist(data);

			data.should.equal( ['arrayTest3.key1=value1', 'arrayTest3.key1=value2', 'arrayTest3.key1=value3', ''].join(os.EOL) );
			next();
		});
	});



	it('should convert complex objects to namespaced keys and values', function (next) {
		var writer = new PropertySerializer.Writer();
		writer.data = {
			arrayTest4: {
				a: { key1: [ 'value1', 'value2', 'value3' ] },
				b: [ 'value1', 'value2', 'value3' ],
				c: { key1: 'test foo' }
			}
		};

		helpers.write(writer.createReadStream(), function (err, data) {
			should.not.exist(err);
			should.exist(data);

			data.should.equal( ['arrayTest4.a.key1=value1', 'arrayTest4.a.key1=value2', 'arrayTest4.a.key1=value3','arrayTest4.b=value1', 'arrayTest4.b=value2', 'arrayTest4.b=value3', 'arrayTest4.c.key1=test foo', ''].join(os.EOL) );
			next();
		});
	});

});
