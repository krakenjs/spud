/*global describe:false, it:false, before:false, beforeEach:false*/

'use strict';

var should = require('should'),
	helpers = require('./helpers'),
    bl = require('bl'),
	JsonSerializer = require('../lib/serializer/json');

describe('JsonReader', function () {

	it('should read keys and values correctly', function (next) {
		var reader = new JsonSerializer.Reader();
		helpers.read('./test/json/locales/us-EN/keyValueTest.json', reader, function (err, data) {
			should.not.exist(err);
			should.exist(data);

			should.equal(data.keyValueTest1, 'My Value 1');
			should.equal(data.keyValueTest2, ' My Value 2');
			should.equal(data.keyValueTest3, 'My Value 3 ');
			should.equal(data.keyValueTest4, ' My Value 4 ');

			next();
		});
	});



	// it('should convert namespaced keys and values to the correct object structure', function (next) {

	// 	var reader = new JsonSerializer.Reader();
	// 	helpers.read('./test/json/locales/us-EN/mapTest.json', reader, function (err, data) {
	// 		should.not.exist(err);
	// 		should.exist(data);

	// 		should.equal(data.objectTest1.key1, 'My Value 1');
	// 		should.equal(data.objectTest1.key2, 'My Value 2');

	// 		should.equal(data.objectTest2.key1, 'My Value 1');
	// 		should.equal(data.objectTest2.key2.key1, 'My Value 2');
	// 		should.equal(data.objectTest2.key3.key2.key1, 'My Value 3');
	// 		should.equal(data.objectTest2.key4.key3.key2.key1, 'My Value 4');

	// 		next();
	// 	});

	// });
});

describe('JsonWriter', function () {

    it('should emit json as a string', function (next) {
        var writer = new JsonSerializer.Writer();
        writer.data = { "a" : "b" };
        writer.createReadStream().pipe(bl(function(err, stuff) {
            should.equal(JSON.parse(stuff.toString('utf-8')).a, "b");
            next();
        }));
    });

});
