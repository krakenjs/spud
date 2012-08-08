/*global describe:false, it:false, before:false, beforeEach:false*/

'use strict';

var should = require('should'),
	helpers = require('./helpers'),
	V4Serializer = require('../lib/serializer/v4');


describe('v4Content', function () {

	describe('deserializer', function () {

		it('should handle ContentElement', function (next) {
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


		it('should handle ContentMap', function (next) {

			var reader = new V4Serializer.Reader();
			helpers.read('./test/v4/locales/us-EN/mapTest.4cb', reader, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				should.equal(data.objectTest1.key1, 'My Value 1');
				should.equal(data.objectTest1.key2, 'My Value 2');
				should.equal(data.objectTest1.key3, 'My Value 3');
				should.equal(data.objectTest1.key4, 'My Value 4');

				next();
			});

		});


		it('should handle ContentStructure', function (next) {

			var reader = new V4Serializer.Reader();
			helpers.read('./test/v4/locales/us-EN/structureTest.4cb', reader, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				should.exist(data.structureTest1.myMap);
				should.exist(data.structureTest1.myElement);

				should.exist(data.structureTest1.myList);
				data.structureTest1.myList.should.have.lengthOf(2);

				should.exist(data.structureTest1.myStructure);

				next();
			});

		});


		it('should handle ContentList', function (next) {

			var reader = new V4Serializer.Reader();
			helpers.read('./test/v4/locales/us-EN/listTest.4cb', reader, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				should.exist(data.myList);
				data.myList.should.have.lengthOf(2);

				next();
			});

		});


		it('should handle DPH', function (next) {

			var reader = new V4Serializer.Reader();
			helpers.read('./test/v4/locales/us-EN/interpolationTest.4cb', reader, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				should.exist(data.myElement1);
				should.exist(data.myElement1.match(/^\{.+\}$/));

				should.exist(data.myElement2);
				should.exist(data.myElement2.match(/^.+\{.+\}$/));

				should.exist(data.myElement3);
				should.exist(data.myElement3.match(/^\{.+\}.+$/));

				should.exist(data.myElement4);
				should.exist(data.myElement4.match(/^.+\{.+\}.+$/));

				should.exist(data.myElement5);
				should.exist(data.myElement5.match(/^\{.+\}.+\{.+\}.+$/));

				next();
			});

		});

	});




	describe('serializer', function () {


	});



});