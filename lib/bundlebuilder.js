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

		var reader = new Reader(file),
			writer = new Writer(file);

		// Write the source to the source reader
		var readStream = fs.createReadStream(file);
		util.pump(readStream, reader, function (err) {
			if (err) {
				callback(err);
				return;
			}

			// Stream the deserialized object to the target writer
			readStream = reader.createReadStream();
			util.pump(readStream, writer, function (err) {

				if (err) {
					callback(err);
					return;
				}

				// Stream the serialized data to the file writer
				var writeStream = fs.createWriteStream('./newFile.' + target);
				readStream = writer.createReadStream();
				util.pump(readStream, writeStream, callback);

			});

		});


	}

};
/*global exports:false*/

