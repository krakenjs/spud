'use strict';

var util = require('util'),
	fs = require('fs');

/*global exports:true*/
exports = module.exports = {

	convert: function (config, callback) {
		var file = config.file,
			source = config.sourceType || 'auto',
			target = config.targetType || 'json';

		if (!file || !fs.existsSync(file)) {
			throw new Error('No source file or folder found.');
		}

		var Reader = require('./serializer/' + source).Reader,
			Writer = require('./serializer/' + target).Writer;

		// Write the source to the source reader
		var readStream = fs.createReadStream(file),
			reader = new Reader();

		util.pump(readStream, reader, function (err) {

			if (err) {
				callback(err);
				return;
			}

			reader.deserialize(function (err, data) {
				if (err) {
					callback(err);
					return;
				}

				var writer = new Writer();
				writer.data = data;
				readStream = writer.createReadStream();

				var writeStream = fs.createWriteStream('./newFile.' + target);

				// Stream the serialized data to the file writer
				util.pump(readStream, writeStream, callback);

			});

		});


	}

};
/*global exports:false*/

