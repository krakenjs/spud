#!/usr/bin/env node
'use strict';

var EOL = require('os').EOL,
    test = require('tape'),
	fs = require('fs'),
	util = require('util'),
	helpers = require('./helpers'),
	WriteStream = require('../lib/writeStream'),
	Transcoder = require('../index');


var TEST_DATA_FILE_PATH = './test/testData.txt',
	TEST_DATA = { key : 'value' },
	TEST_RESULT = 'key=value';

test('spud#registerSerializer should register a serializer with a unique name', function (t) {
    // Should have no return value if the serializer is new
    var existing = Transcoder.registerSerializer('mock', helpers.MockSerializer);
    t.notOk(existing);
    t.end();
});


test('spud#registerSerializer should return the existing serializer if replacing one with the same name', function (t) {
    // Should have no return value if the serializer is new
    var existing = Transcoder.registerSerializer('mock', helpers.MockSerializer);
    t.ok(existing);
    t.equal(existing, helpers.MockSerializer);
    t.end();
});


test('spud#registerSerializer should recognize the registered serializer', function (t) {
    Transcoder.serialize(TEST_DATA, 'mock', function (err, data) {
        t.notOk(err);
        t.ok(data);
        t.equal(data, TEST_RESULT);
        t.end();
    });
});

test('spud#deserialize should accept a file', function (t) {

    Transcoder.deserialize(TEST_DATA_FILE_PATH, 'mock', function (err, data) {
        t.notOk(err);
        t.ok(data);

        // Sanity check
        t.equal(data.key, 'value');

        t.end();
    });

});


test('spud#deserialize should accept a stream', function (t) {

    var stream = fs.createReadStream(TEST_DATA_FILE_PATH);
    Transcoder.deserialize(stream, 'mock', function (err, data) {
        t.notOk(err);
        t.ok(data);

        // Sanity check
        t.equal(data.key, 'value');

        t.end();
    });
});


test('spud#deserialize should accept a buffer', function (t) {

    var readStream = fs.createReadStream(TEST_DATA_FILE_PATH),
        writeStream = new WriteStream();

    readStream.on('error', function () {
        t.fail();
        t.end();
    });
    readStream.on('close', function () {
        Transcoder.deserialize(writeStream.data, 'mock', function (err, data) {
            t.notOk(err);
            t.ok(data);

            // Sanity check
            t.equal(data.key, 'value');

            t.end();
        });
    });
    readStream.pipe(writeStream);

});

test('spud#serialize should write the result to a stream', function (t) {

    var writeStream = new WriteStream();

    Transcoder.serialize(TEST_DATA, 'mock', writeStream, function (err) {
        t.notOk(err);
        t.ok(writeStream.data);

        // Sanity check
        t.equal(writeStream.data.toString('utf8'), TEST_RESULT);

        t.end();
    });

});


test('spud#serialize should return the result to a callback', function (t) {

    Transcoder.serialize(TEST_DATA, 'mock', function (err, data) {
        t.notOk(err);
        t.ok(data);

        // Sanity check
        t.equal(data, TEST_RESULT);

        t.end();
    });

});


test('spud#serialize should write the result to a stream and return the result to a callback', function (t) {

    var writeStream = new WriteStream();

    Transcoder.serialize(TEST_DATA, 'mock', writeStream, function (err, data) {
        t.notOk(err);
        t.ok(data);
        t.ok(writeStream.data);

        // Sanity check
        t.equal(data, writeStream.data.toString('utf8'));
        t.equal(TEST_RESULT, writeStream.data.toString('utf8'));
        t.equal(TEST_RESULT, data);

        t.end();
    });

});

test('spud#convert should accept a file', function (t) {

    Transcoder.convert(TEST_DATA_FILE_PATH, 'mock', 'mock', function (err, data) {
        t.notOk(err);
        t.ok(data);

        // Sanity check
        t.equal(TEST_RESULT, data);

        t.end();
    });

});


test('spud#convert should accept a stream', function (t) {

    var stream = fs.createReadStream(TEST_DATA_FILE_PATH);
    Transcoder.convert(stream, 'mock', 'mock', function (err, data) {
        t.notOk(err);
        t.ok(data);

        // Sanity check
        t.equal(TEST_RESULT, data);

        t.end();
    });

});


test('spud#convert should accept a buffer', function (t) {

    var readStream = fs.createReadStream(TEST_DATA_FILE_PATH),
        writeStream = new WriteStream();

    readStream.on('error', function () {
        t.fail();
        t.end();
    });
    readStream.on('close', function () {
        Transcoder.convert(writeStream.data, 'mock', 'mock', function (err, data) {
            t.notOk(err);
            t.ok(data);

            // Sanity check
            t.equal(TEST_RESULT, data);

            t.end();
        });
    });

    readStream.pipe(writeStream);

});


test('spud#convert should write the result to a stream', function (t) {

    var writeStream = new WriteStream(),
        data = new Buffer(TEST_RESULT);

    Transcoder.convert(data, 'mock', 'mock', writeStream, function (err) {
        t.notOk(err);
        t.ok(writeStream.data);

        // Sanity check
        t.equal(TEST_RESULT, writeStream.data.toString('utf8'));

        t.end();
    });

});


test('spud#convert should return the result to a callback', function (t) {

    var data = new Buffer(TEST_RESULT);

    Transcoder.convert(data, 'mock', 'mock', function (err, data) {
        t.notOk(err);
        t.ok(data);

        // Sanity check
        t.equal(TEST_RESULT, data);

        t.end();
    });

});


test('spud#convert should write the result to a stream and return the result to a callback', function (t) {

    var writeStream = new WriteStream(),
        data = new Buffer(TEST_RESULT);

    Transcoder.convert(data, 'mock', 'mock', writeStream, function (err, data) {
        t.notOk(err);
        t.ok(data);
        t.ok(writeStream.data);

        // Sanity check
        t.equal(data, writeStream.data.toString('utf8'));
        t.equal(TEST_RESULT, writeStream.data.toString('utf8'));
        t.equal(TEST_RESULT, data);

        t.end();
    });

});
