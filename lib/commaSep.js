"use strict";

function matchCommaSeparated(str) {
	var start = 0;
	var states = {
		OUT: 0,
		MARK: 1,
		QUOTE: 2,
		ESCAPE: 3,
		UNQUOTE: 4
	};
	var quote = '';
	var state = states.OUT;
	var out = [];
	var i = 0;
	do {
		if (state === states.OUT) {
			if (str[i] === ' ') {
				continue;
			} else if (str[i] === '"' || str[i] === "'") {
				start = i+1;
				quote = str[i];
				state = states.QUOTE;
			} else if (str[i] === ",") {
				throw new Error("Unexpected , at " + i);
			} else if (str[i] === void 0) {
				continue;
			} else {
				start = i;
				state = states.MARK;
			}
		} else if (state === states.MARK) {
			if (str[i] === "," || str[i] === void 0) {
				out.push(str.slice(start, i));
				state = states.OUT;
			}
		} else if (state === states.QUOTE) {
			if (str[i] === "\\") {
				state = states.ESCAPE;
			} else if (str[i] === quote) {
				out.push(str.slice(start, i).replace(/\\(.)/, unesc));
				state = states.UNQUOTE;
			} else if (str[i] === void 0) {
				throw new Error("unexpected end of string at " + i);
			}
		} else if (state === states.ESCAPE) {
			if (str[i] === void 0) {
				throw new Error("unexpected end of string at " + i);
			} else {
				state = states.QUOTE;
			}
		} else if (state === states.UNQUOTE) {
			if (str[i] === void 0 || str[i] === " ") {
				continue;
			} else if (str[i] === ",") {
				state = states.OUT;
			} else {
				throw new Error("unexpected " + str[i] + " at " + i);
			}
		}
	} while (i++ <= str.length);

	return out;
}

function unesc(m, esc) {
	if (esc === 'b') {
		return String.charCodeAt(8);
	} else if (esc === 'n') {
		return String.charCodeAt(10);
	} else if (esc === 'r') {
		return String.charCodeAt(13);
	} else if (esc === 't') {
		return String.charCodeAt(9);
	} else if (esc === 'v') {
		return String.charCodeAt(11);
	} else {
		return esc;
	}
	return m[0];
}

module.exports = matchCommaSeparated;
