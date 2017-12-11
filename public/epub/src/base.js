'use strict';

var EPUBJS = EPUBJS || {};
EPUBJS.VERSION = "0.2.14";

EPUBJS.plugins = EPUBJS.plugins || {};

EPUBJS.filePath = EPUBJS.filePath || "/epubjs/";

EPUBJS.Render = {};

(function(root) {

	var previousEpub = root.ePub || {};

	var ePub = root.ePub = function() {
		var bookPath, options;

		//-- var Book = ePub("path/to/Book.epub", { restore: true })
		if(typeof(arguments[0]) != 'undefined' &&
			(typeof arguments[0] === 'string' || arguments[0] instanceof ArrayBuffer)) {

			bookPath = arguments[0];

			if( arguments[1] && typeof arguments[1] === 'object' ) {
				options = arguments[1];
				options.bookPath = bookPath;
			} else {
				options = { 'bookPath' : bookPath };
			}

		}

		/*
		*   var Book = ePub({ bookPath: "path/to/Book.epub", restore: true });
		*
		*   - OR -
		*
		*   var Book = ePub({ restore: true });
		*   Book.open("path/to/Book.epub");
		*/

		if( arguments[0] && typeof arguments[0] === 'object' && !(arguments[0] instanceof ArrayBuffer)) {
			options = arguments[0];
		}


		return new EPUBJS.Book(options);
	};

	//exports to multiple environments
	if (typeof define === 'function' && define.amd) {
		//AMD
		define(['rsvp', 'jszip', 'localforage'], function(RSVP, JSZip, localForage){ return ePub; });
	} else if (typeof module != "undefined" && module.exports) {
		//Node
		global.RSVP = require('rsvp');
		global.JSZip = require('jszip');
		global.localForage = require('localforage');
		module.exports = ePub;
	}

})(window);