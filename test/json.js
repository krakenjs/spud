#!/usr/bin/env node
'use strict';

var helpers = require('./helpers'),
    test = require('tape'),
    bl = require('bl'),
	JsonSerializer = require('../lib/serializer/json');

test('JsonReader should read keys and values correctly', function (t) {
    var reader = new JsonSerializer.Reader();
    helpers.read('./test/json/locales/us-EN/keyValueTest.json', reader, function (err, data) {
        t.notOk(err, 'no error');
        t.ok(data);

        t.equal(data.keyValueTest1, 'My Value 1');
        t.equal(data.keyValueTest2, ' My Value 2');
        t.equal(data.keyValueTest3, 'My Value 3 ');
        t.equal(data.keyValueTest4, ' My Value 4 ');

        t.end();
    });
});



test('JsonReader should convert namespaced keys and values to the correct object structure', function (t) {

    var reader = new JsonSerializer.Reader();
    helpers.read('./test/json/locales/us-EN/mapTest.json', reader, function (err, data) {
        t.notOk(err);
        t.ok(data);

        t.equal(data.objectTest1.key1, 'My Value 1');
        t.equal(data.objectTest1.key2, 'My Value 2');

        t.equal(data.objectTest2.key1, 'My Value 1');
        t.equal(data.objectTest2.key2.key1, 'My Value 2');
        t.equal(data.objectTest2.key3.key2.key1, 'My Value 3');
        t.equal(data.objectTest2.key4.key3.key2.key1, 'My Value 4');

        t.end();
    });
});

test('JsonWriter should emit json as a string', function (t) {
    var writer = new JsonSerializer.Writer();
    writer.data = { "a" : "b" };
    writer.createReadStream().pipe(bl(function(err, stuff) {
        t.equal(JSON.parse(stuff.toString('utf-8')).a, "b");
        t.end();
    }));
});
