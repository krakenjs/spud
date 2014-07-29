#!/usr/bin/env node

'use strict';

var util = require('util'),
	test = require('tape'),
	os = require('os'),
	bl = require('bl'),
	helpers = require('./helpers'),
	PropertySerializer = require('../lib/serializer/properties');

require('string.fromcodepoint');


test('PropertyReader should read keys and values correctly', function (t) {

	var reader = new PropertySerializer.Reader();
	helpers.read('./test/properties/locales/en-US/keyValueTest.properties', reader, function (err, data) {
		t.notOk(err);
		t.ok(data);

		t.equal(data.keyValueTest1, 'My Value 1');
		t.equal(data.keyValueTest2, ' My Value 2');
		t.equal(data.keyValueTest3, 'My Value 3 ');
		t.equal(data.keyValueTest4, ' My Value 4 ');
		t.equal(data.aPage.overWriteTest, 'New value!');
		t.equal(data[42], 'universe');
		t.equal(data.a_b, 'abc');
		t.equal(data['@@'], 'at');
		t.equal(data['!#'], 'bangpound');
		t.equal(data['"\''], 'quotes');
		t.equal(data["espa\u00F1ol"], 'spanish');
		t.equal(data["\u2603escapeA"], 'snowmanEscapeA');
		t.equal(data["\u2708"], 'airplane');
		t.equal(data["\u2603"], 'snowman');
		t.equal(data[String.fromCodePoint(128169)], 'pileOfPoo');
		t.equal(data[String.fromCodePoint(128169)+ "\u2708"], 'pooOnAPlane');


		t.end();
	});

});



test('PropertyReader should convert associative array-style keys into object maps', function (t) {

	var reader = new PropertySerializer.Reader();
	helpers.read('./test/properties/locales/en-US/mapTest.properties', reader, function (err, data) {
		t.notOk(err);
		t.ok(data);
		t.equal(data.deeper.mapTest['0'], 'value1');
		t.equal(data.deeper.mapTest.one, 'value2');
		t.equal(data.deeper.mapTest.two, 'value3');
		t.equal(data.deeper.mapTest.three, 'value4');
		t.equal(data.deeper.mapTest.four.one, 'value5');
		t.equal(data.deeper.mapTest.four.two, 'value6');
		t.equal(data.deeper.mapTest.a_b, 'abc');
		t.equal(data.deeper.mapTest['1a'], '1A');
		t.equal(data.deeper.mapTest['@@'], 'at');
		t.equal(data.deeper.mapTest.ABC, 'ABC');
		t.equal(data.deeper.mapTest['a[]'], 'brackets');
		t.equal(data.deeper.mapTest['"\''], 'quotes');
		t.equal(data.deeper.mapTest["espa\u00F1ol"], 'spanish');
		t.equal(data.deeper.mapTest["\u2603"], 'snowman');
		t.end();
	});
});

test('PropertyReader should convert numeric array-style keys into javascript arrays', function (t) {

	var reader = new PropertySerializer.Reader();
	helpers.read('./test/properties/locales/en-US/arrayTest.properties', reader, function (err, data) {
		t.notOk(err);
		t.ok(data);

// Disable push-like syntax putting value in the last element so we don't preclude future push impl
//		t.equal(Array.isArray(data.deeper.arrayPush), false);
//		t.equal(data.deeper.arrayPush, 'value3');

		t.equal(Array.isArray(data.deeper.arrayIndexed), true);
		t.equal(data.deeper.arrayIndexed.length, 3);
		t.equal(data.deeper.arrayIndexed[0], 'value1');
		t.equal(data.deeper.arrayIndexed[1], 'value2');
		t.equal(data.deeper.arrayIndexed[2], 'value3');

		t.equal(Array.isArray(data.multi.indexed), true);
		t.equal(data.multi.indexed.length, 2);
		t.equal(data.multi.indexed[0].length, 3);
		t.equal(data.multi.indexed[1].length, 3);
		t.equal(data.multi.indexed[0][0], 'value1');
		t.equal(data.multi.indexed[0][1], 'value2');
		t.equal(data.multi.indexed[0][2], 'value3');
		t.equal(data.multi.indexed[1][0], 'value4');
		t.equal(data.multi.indexed[1][1], 'value5');
		t.equal(data.multi.indexed[1][2], 'value6');

		t.equal(Array.isArray(data.address.state), true);
		t.equal(data.address.state[0].key, 'AZ');
		t.equal(data.address.state[0].value, 'Arizona');
		t.equal(data.address.state[1].key, 'CA');
		t.equal(data.address.state[1].value, 'California');

		t.equal(data.contrived.arr1[0].testing, '123');
		t.equal(data.contrived.arr2[0].testing, '456');

		t.equal(data['@@'][0], 'at');
		t.equal(data['"\''][0], 'quotes');
		t.equal(data['espa\u00F1ol'][0], 'spanish');


		t.end();
	});

});

test('PropertyWriter should convert a simple object to a simple property list', function (t) {
	var writer = new PropertySerializer.Writer();
	writer.data = {
		'keyValueTest1': 'My Value 1',
		'keyValueTest2': ' My Value 2'
	};

	writer.createReadStream().pipe(bl(function (err, data) {
		data = data.toString('utf-8');
		t.notOk(err);
		t.ok(data);

		t.equal(data,  ['keyValueTest1=My Value 1', 'keyValueTest2= My Value 2', ''].join(os.EOL) );
		t.end();
	}));
});



test('PropertyWriter shoud convert a compound object to namespaced keys and values', function (t) {
	var writer = new PropertySerializer.Writer();
	writer.data = {
		objectTest2: {
			key1: 'My Value 1',
			key2: { key1: 'My Value 2' }
		}
	};

	helpers.write(writer.createReadStream(), function (err, data) {
		t.notOk(err);
		t.ok(data);

		t.equal(data,  ['objectTest2.key1=My Value 1', 'objectTest2.key2.key1=My Value 2', ''].join(os.EOL) );
		t.end();
	});

});



test('PropertyWriter should convert an array to identically named keys', function (t) {
	var writer = new PropertySerializer.Writer();
	writer.data = {
		arrayTest2: [ 'value1', 'value2', 'value3' ]
	};

	helpers.write(writer.createReadStream(), function (err, data) {
		t.notOk(err);
		t.ok(data);

		t.equal(data,  ['arrayTest2=value1', 'arrayTest2=value2', 'arrayTest2=value3', ''].join(os.EOL) );
		t.end();
	});
});



test('PropertyWriter should convert an array in a compound object to namespaced keys and array values', function (t) {
	var writer = new PropertySerializer.Writer();
	writer.data = {
		arrayTest3: {
			key1: [ 'value1', 'value2', 'value3' ]
		}
	};

	helpers.write(writer.createReadStream(), function (err, data) {
		t.notOk(err);
		t.ok(data);

		t.equal(data,  ['arrayTest3.key1=value1', 'arrayTest3.key1=value2', 'arrayTest3.key1=value3', ''].join(os.EOL) );
		t.end();
	});
});



test('PropertyWriter should convert complex objects to namespaced keys and values', function (t) {
	var writer = new PropertySerializer.Writer();
	writer.data = {
		arrayTest4: {
			a: { key1: [ 'value1', 'value2', 'value3' ] },
			b: [ 'value1', 'value2', 'value3' ],
			c: { key1: 'test foo' }
		}
	};

	writer.createReadStream().pipe(bl(function (err, data) {
		t.notOk(err);
		t.ok(data);

		t.equal(data.toString('utf-8'),  ['arrayTest4.a.key1=value1', 'arrayTest4.a.key1=value2', 'arrayTest4.a.key1=value3','arrayTest4.b=value1', 'arrayTest4.b=value2', 'arrayTest4.b=value3', 'arrayTest4.c.key1=test foo', ''].join(os.EOL) );
		t.end();
	}));
});

test('PropertyWriter should convert numbers and booleans and nulls', function (t) {
	var writer = new PropertySerializer.Writer();
	writer.data = {
		a: 1,
		b: true,
		c: false,
		d: null,
		e: NaN,
		f: function () {}
	};

	writer.createReadStream().pipe(bl(function (err, data) {
		t.notOk(err);
		t.ok(data);

		t.equal(data.toString('utf-8'),  ['a=1', 'b=true', 'c=false','d=null', 'e=', ''].join(os.EOL) );
		t.end();
	}));
});
