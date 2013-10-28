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
		helpers.read('./test/properties/locales/en-US/keyValueTest.properties', reader, function (err, data) {
			should.not.exist(err);
			should.exist(data);

			should.equal(data.keyValueTest1, 'My Value 1');
			should.equal(data.keyValueTest2, ' My Value 2');
			should.equal(data.keyValueTest3, 'My Value 3 ');
			should.equal(data.keyValueTest4, ' My Value 4 ');
			should.equal(data.aPage.overWriteTest, 'New value!');
			should.equal(data[42], 'universe');
			should.equal(data.a_b, 'abc');
			should.equal(data['@@'], 'at');
			should.equal(data['!#'], 'bangpound');
			should.equal(data['"\''], 'quotes');
			should.equal(data["espa\u00F1ol"], 'spanish');
			should.equal(data["\u2603escapeA"], 'snowmanEscapeA');
			should.equal(data["\u2603"], 'snowman');

			next();
		});

	});



	it('should convert associative array-style keys into object maps', function (next) {

		var reader = new PropertySerializer.Reader();
		helpers.read('./test/properties/locales/en-US/mapTest.properties', reader, function (err, data) {
			should.not.exist(err);
			should.exist(data);
			should.equal(data.deeper.mapTest['0'], 'value1');
			should.equal(data.deeper.mapTest.one, 'value2');
			should.equal(data.deeper.mapTest.two, 'value3');
			should.equal(data.deeper.mapTest.three, 'value4');
			should.equal(data.deeper.mapTest.four.one, 'value5');
			should.equal(data.deeper.mapTest.four.two, 'value6');
			should.equal(data.deeper.mapTest['a_b'], 'abc');
			should.equal(data.deeper.mapTest['1a'], '1A');
			should.equal(data.deeper.mapTest['@@'], 'at');
			should.equal(data.deeper.mapTest['ABC'], 'ABC');
			should.equal(data.deeper.mapTest['a[]'], 'brackets');
			should.equal(data.deeper.mapTest['"\''], 'quotes');
			should.equal(data.deeper.mapTest["espa\u00F1ol"], 'spanish');
			should.equal(data.deeper.mapTest["\u2603"], 'snowman');
			next();
		});

	});



	it('should convert numeric array-style keys into javascript arrays', function (next) {

		var reader = new PropertySerializer.Reader();
		helpers.read('./test/properties/locales/en-US/arrayTest.properties', reader, function (err, data) {
			should.not.exist(err);
			should.exist(data);

	// Disable push-like syntax putting value in the last element so we don't preclude future push impl
	//		Array.isArray(data.deeper.arrayPush).should.be.false;
	//		data.deeper.arrayPush.should.equal('value3');

			Array.isArray(data.deeper.arrayIndexed).should.be.true;
			data.deeper.arrayIndexed.length.should.equal(3);
			data.deeper.arrayIndexed[0].should.equal('value1');
			data.deeper.arrayIndexed[1].should.equal('value2');
			data.deeper.arrayIndexed[2].should.equal('value3');

			Array.isArray(data.multi.indexed).should.be.true;
			data.multi.indexed.length.should.equal(2);
			data.multi.indexed[0].length.should.equal(3);
			data.multi.indexed[1].length.should.equal(3);
			data.multi.indexed[0][0].should.equal('value1');
			data.multi.indexed[0][1].should.equal('value2');
			data.multi.indexed[0][2].should.equal('value3');
			data.multi.indexed[1][0].should.equal('value4');
			data.multi.indexed[1][1].should.equal('value5');
			data.multi.indexed[1][2].should.equal('value6');

			Array.isArray(data.address.state).should.be.true;
			data.address.state[0].key.should.equal('AZ');
			data.address.state[0].value.should.equal('Arizona');
			data.address.state[1].key.should.equal('CA');
			data.address.state[1].value.should.equal('California');

			data.contrived.arr1[0].testing.should.equal('123');
			data.contrived.arr2[0].testing.should.equal('456');

console.log("DATA", data);
			data['@@'][0].should.equal('at');
			data['"\''][0].should.equal('quotes');
			data['espa\u00F1ol'][0].should.equal('spanish');


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
