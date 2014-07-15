/*global describe:false, it:false, before:false, beforeEach:false*/

'use strict';

var EOL = require('os').EOL,
	fs = require('fs'),
	util = require('util'),
	should = require('should'),
	helpers = require('./helpers'),
	WriteStream = require('../lib/writeStream'),
	Transcoder = require('../index');


var TEST_DATA_FILE_PATH = './test/testData.txt',
	TEST_DATA = { key : 'value' },
	TEST_RESULT = 'key=value';

describe('spud', function () {

	describe("#registerSerializer", function () {

		it('should register a serializer with a unique name', function (next) {
			// Should have no return value if the serializer is new
			var existing = Transcoder.registerSerializer('mock', helpers.MockSerializer);
			should.not.exist(existing);
			next();
		});


		it('should return the existing serializer if replacing one with the same name', function (next) {
			// Should have no return value if the serializer is new
			var existing = Transcoder.registerSerializer('mock', helpers.MockSerializer);
			should.exist(existing);
			existing.should.equal(helpers.MockSerializer);
			next();
		});


		it('should recognize the registered serializer', function (next) {
			Transcoder.serialize(TEST_DATA, 'mock', function (err, data) {
				should.not.exist(err);
				should.exist(data);
				TEST_RESULT.should.equal(data);
				next();
			});
		});

	});



	describe('#deserialize()', function () {

		it('should accept a file', function (next) {

			Transcoder.deserialize(TEST_DATA_FILE_PATH, 'mock', function (err, data) {
				should.not.exist(err);
				should.exist(data);

				// Sanity check
				data.should.have.property('key', 'value');

				next();
			});

		});


		it('should accept a stream', function (next) {

			var stream = fs.createReadStream(TEST_DATA_FILE_PATH);
			Transcoder.deserialize(stream, 'mock', function (err, data) {
				should.not.exist(err);
				should.exist(data);

				// Sanity check
				data.should.have.property('key', 'value');

				next();
			});

		});


		it('should accept a buffer', function (next) {

			var readStream = fs.createReadStream(TEST_DATA_FILE_PATH),
				writeStream = new WriteStream();

            readStream.on('error', next);
            readStream.on('close', function () {
                Transcoder.deserialize(writeStream.data, 'mock', function (err, data) {
                    should.not.exist(err);
                    should.exist(data);

                    // Sanity check
                    data.should.have.property('key', 'value');

                    next();
                });
            });
            readStream.pipe(writeStream);

		});

	});



	describe('#serialize()', function () {

		it('should write the result to a stream', function (next) {

			var writeStream = new WriteStream();

			Transcoder.serialize(TEST_DATA, 'mock', writeStream, function (err) {
				should.not.exist(err);
				should.exist(writeStream.data);

				// Sanity check
				TEST_RESULT.should.equal(writeStream.data.toString('utf8'));

				next();
			});

		});


		it('should return the result to a callback', function (next) {

			Transcoder.serialize(TEST_DATA, 'mock', function (err, data) {
				should.not.exist(err);
				should.exist(data);

				// Sanity check
				TEST_RESULT.should.equal(data);

				next();
			});

		});


		it('should write the result to a stream and return the result to a callback', function (next) {

			var writeStream = new WriteStream();

			Transcoder.serialize(TEST_DATA, 'mock', writeStream, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				should.exist(writeStream.data);

				// Sanity check
				data.should.equal(writeStream.data.toString('utf8'));
				TEST_RESULT.should.equal(writeStream.data.toString('utf8'));
				TEST_RESULT.should.equal(data);

				next();
			});

		});

	});



	describe('#convert()', function () {

		it('should accept a file', function (next) {

			Transcoder.convert(TEST_DATA_FILE_PATH, 'mock', 'mock', function (err, data) {
				should.not.exist(err);
				should.exist(data);

				// Sanity check
				TEST_RESULT.should.equal(data);

				next();
			});

		});


		it('should accept a stream', function (next) {

			var stream = fs.createReadStream(TEST_DATA_FILE_PATH);
			Transcoder.convert(stream, 'mock', 'mock', function (err, data) {
				should.not.exist(err);
				should.exist(data);

				// Sanity check
				TEST_RESULT.should.equal(data);

				next();
			});

		});


		it('should accept a buffer', function (next) {

			var readStream = fs.createReadStream(TEST_DATA_FILE_PATH),
				writeStream = new WriteStream();

            readStream.on('error', next);
            readStream.on('close', function () {
                Transcoder.convert(writeStream.data, 'mock', 'mock', function (err, data) {
                    should.not.exist(err);
                    should.exist(data);

                    // Sanity check
                    TEST_RESULT.should.equal(data);

                    next();
                });
            });

            readStream.pipe(writeStream);

		});


		it('should write the result to a stream', function (next) {

			var writeStream = new WriteStream(),
				data = new Buffer(TEST_RESULT);

			Transcoder.convert(data, 'mock', 'mock', writeStream, function (err) {
				should.not.exist(err);
				should.exist(writeStream.data);

				// Sanity check
				TEST_RESULT.should.equal(writeStream.data.toString('utf8'));

				next();
			});

		});


		it('should return the result to a callback', function (next) {

			var data = new Buffer(TEST_RESULT);

			Transcoder.convert(data, 'mock', 'mock', function (err, data) {
				should.not.exist(err);
				should.exist(data);

				// Sanity check
				TEST_RESULT.should.equal(data);

				next();
			});

		});


		it('should write the result to a stream and return the result to a callback', function (next) {

			var writeStream = new WriteStream(),
				data = new Buffer(TEST_RESULT);

			Transcoder.convert(data, 'mock', 'mock', writeStream, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				should.exist(writeStream.data);

				// Sanity check
				data.should.equal(writeStream.data.toString('utf8'));
				TEST_RESULT.should.equal(writeStream.data.toString('utf8'));
				TEST_RESULT.should.equal(data);

				next();
			});

		});

	});

});
