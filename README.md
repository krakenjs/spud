Tater (t8r, or transcoder)
---------------------------
Convert content bundles to and from different formats, including .properties, .json, .4cb, etc.



Plugins
---------------------------
Writing serializers is easy. It's just 3 steps:

1) Make sure your module exports an object with a property called 'Reader' and one called 'Writer' whose values
are the constructors for your deserializer and serialzer, respectively:

```javascript
// index.js
module.exports = {
	Reader: MyReader,
	Writer: MyWriter
};
```

2) Build out your deserializer implementation. It merely needs to implement a method called _doDeserialize that
accepts data (in the form of a string) and callback arguments, and invokes the callback with error and deserialized data.

```javascript
function MyReader() {

}

MyReader.prototype = {
	_doDeserialize: function(input, callback) {
		// TODO: Implement
		var data = null;
		// ...
		callback(null, data);
	};
};
```

3) Build out your serializer implementation and a Read Stream for outputting the serialized data. 

``` javascript
function MyWriter() {

}

MyWriter.prototype = {
	_doCreateReadStream: function (data) {
		return new CustomReadStream(data);
	}
};
```

The stream must accept a data object in its constructor and implement the [NodeJS Read Stream interface]
(http://nodejs.org/api/stream.html#stream_readable_stream). It is likely that this where your serialization
implementation will go. When chunks of data are availble/serialized, write them out using the 'data' event.

```javascript
var util = require('util');

function CustomReadStream(data) {
	Stream.call(this);
	this._data = data;
}
util.inherits(ReadStream, Stream);

MyStream.prototype.pause = function () {
	// noop	
};

MyStream.prototype.drain = function () {
	// noop
};

MyStream.prototype.resume = function () {
	var serialized = null;
	// TODO: Serialize this._data
	this.emit('data', serialized);
};
```
