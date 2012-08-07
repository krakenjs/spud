/*global describe:false, it:false, before:false, beforeEach:false*/

'use strict';

var should = require('should'),
	fs = require('fs'),
	BundleBuilder = require('../index');


describe('BundleBuilder', function () {


	it('should convert JSON to properties correctly', function (next) {
		BundleBuilder.convert('./test/json/locales/us-EN/login.json', 'json', 'properties', function (err, data) {
			should.not.exist(err);
			should.exist(data);
			next();
		});
	});

	it('should convert JSON to properties file correctly', function (next) {

		BundleBuilder.convert('./test/json/locales/us-EN/login.json', 'json', 'properties', function (err, data) {
			should.not.exist(err);
			should.exist(data);
			next();
		});
	});

	it('should convert properties to json correctly', function (next) {
		BundleBuilder.convert('./test/properties/locales/us-EN/login.properties', 'properties', 'json', function (err, data) {
			should.not.exist(err);
			should.exist(data);
			next();
		});
	});

	it('should convert v4 to json correctly', function (next) {
		BundleBuilder.convert('./test/v4/locales/us-EN/login.4cb', 'v4', 'json', function (err, data) {
			should.not.exist(err);
			should.exist(data);
			next();
		});
	});

	it('should convert v4 to properties correctly', function (next) {
		BundleBuilder.convert('./test/v4/locales/us-EN/login.4cb', 'v4', 'properties', function (err, data) {
			should.not.exist(err);
			should.exist(data);
			next();
		});
	});

	it('should deserialize JSON without error', function (next) {
		BundleBuilder.deserialize('./test/json/locales/us-EN/login.json', 'json', function (err, data) {
			should.not.exist(err);
			should.exist(data);
			next();
		});
	});

	it('should deserialize properties without error', function (next) {
		BundleBuilder.deserialize('./test/properties/locales/us-EN/login.properties', 'properties', function (err, data) {
			should.not.exist(err);
			should.exist(data);
			next();
		});
	});

	it('should deserialize 4cb without error', function (next) {
		BundleBuilder.deserialize('./test/v4/locales/us-EN/login.4cb', 'v4', function (err, data) {
			should.not.exist(err);
			should.exist(data);
			next();
		});
	});

	// it('should convert json to v4 content correctly', function (next) {
	// 	BundleBuilder.convert( { file : './test/json/locales/us-EN/login.json', sourceType : 'json', targetType : 'v4' }, next );
	// });

});