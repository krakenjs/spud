#!/usr/bin/env node
'use strict';

var EOL = require('os').EOL,
	test = require('tape'),
	fs = require('fs'),
	path = require('path'),
	bl = require('bl'),
	util = require('util'),
	helpers = require('./helpers'),
	Transcoder = require('../index');


var TEST_DATA_FILE_PATH = path.resolve(__dirname, 'testData.txt'),
	TEST_DATA = { key : 'value' },
	TEST_RESULT = 'key=value';


var FALLBACK_DATA_FILE_PATH = path.resolve(__dirname, 'main.properties'),
	FALLBACK_DATA = { hello: "world", another: "question" };

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

	var readStream = fs.readFile(TEST_DATA_FILE_PATH, function (err, data) {
		if (err) {
			t.fail(err);
			return t.end();
		}

		Transcoder.deserialize(data, 'mock', function (err, data) {
			t.notOk(err);
			t.ok(data);

			// Sanity check
			t.equal(data.key, 'value');

			t.end();
		});
	});
});

test('spud#deserialize should process included files', function (t) {
	Transcoder.deserialize(fs.createReadStream(FALLBACK_DATA_FILE_PATH), 'properties', function (err, data) {
		if (err) {
			t.fail(err);
			return t.end();
		}

		t.notOk(err);
		t.ok(data);

		// Sanity check
		t.equal(data.hello, 'world');
		t.equal(data.another, 'question');
		t.end();
	});
});

test('spud#serialize should write the result to a stream', function (t) {

	Transcoder.serialize(TEST_DATA, 'mock', bl(function (err, data) {
		t.notOk(err);
		t.ok(data);

		// Sanity check
		t.equal(data.toString('utf8'), TEST_RESULT);

		t.end();
	}));

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

	Transcoder.serialize(TEST_DATA, 'mock', bl(function (err, data) {
		t.notOk(err);
		t.ok(data);

		t.equal(TEST_RESULT, data.toString('utf8'));
	}), function (err, data) {
		t.notOk(err);
		t.ok(data);

		// Sanity check
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

	fs.readFile(TEST_DATA_FILE_PATH, function (err, data) {
		if (err) {
			t.fail(err);
			return t.end();
		}

		Transcoder.convert(data, 'mock', 'mock', function (err, data) {
			t.notOk(err);
			t.ok(data);

			// Sanity check
			t.equal(TEST_RESULT, data);

			t.end();
		});
	});

});


test('spud#convert should write the result to a stream', function (t) {

	var data = new Buffer(TEST_RESULT);

	Transcoder.convert(data, 'mock', 'mock', bl(function (err, data) {
		t.notOk(err);
		t.ok(data);

		// Sanity check
		t.equal(TEST_RESULT, data.toString('utf8'));

		t.end();
	}));

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

	var outstanding = 2;
	var data = new Buffer(TEST_RESULT);

	Transcoder.convert(data, 'mock', 'mock', bl(function (err, result) {
		t.notOk(err);
		t.ok(result);

		t.equal(TEST_RESULT, result.toString('utf8'));

		if (--outstanding === 0) {
			t.end();
		}
	}), function (err, data) {
		t.notOk(err);
		t.ok(data);

		// Sanity check
		t.equal(TEST_RESULT, data);

		if (--outstanding === 0) {
			t.end();
		}
	});

});
