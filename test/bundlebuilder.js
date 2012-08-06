/*global describe:false, it:false, before:false, beforeEach:false*/

'use strict';

var should = require('should'),
	BundleBuilder = require('../index');


describe('JsonReader', function () {


	it('should convert JSON to properties correctly', function (next) {
		BundleBuilder.convert( { file : './test/json/locales/us-EN/login.json', sourceType : 'json', targetType : 'properties' }, next );
	});

	it('should convert properties to json correctly', function (next) {
		BundleBuilder.convert( { file : './test/properties/locales/us-EN/login.properties', sourceType : 'properties', targetType : 'json' }, next );
	});

	it('should convert v4 to json correctly', function (next) {
		BundleBuilder.convert( { file : './test/v4/locales/us-EN/login.4cb', sourceType : 'v4', targetType : 'json' }, next );
	});

	it('should convert v4 to properties correctly', function (next) {
		BundleBuilder.convert( { file : './test/v4/locales/us-EN/login.4cb', sourceType : 'v4', targetType : 'properties' }, next );
	});

	// it('should convert json to v4 content correctly', function (next) {
	// 	BundleBuilder.convert( { file : './test/json/locales/us-EN/login.json', sourceType : 'json', targetType : 'v4' }, next );
	// });

});