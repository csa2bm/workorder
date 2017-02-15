sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/format/DateFormat"
], function(NumberFormat, DateFormat) {
	"use strict";

	return {

		/**
		 * Upper the first character of giving string
		 * param{String} sStr input string
		 * @returns {String}} the input string with the first uppercase character
		 */
		// uppercaseFirstChar: function(sStr) {
		// 	return sStr.charAt(0).toUpperCase() + sStr.slice(1);
		// },uppercaseFirstChar

		// /**
		//  * Returns false if a string is empty
		//  * param{String} sStr input string
		//  * @returns {Boolean}} false if the input string is empty
		//  */
		// isNotEmptyStr: function(sStr) {
		// 	if (!sStr || sStr === "") {
		// 		return false;
		// 	} else {
		// 		return true;
		// 	}
		// },

		// /**
		//  * Convert type date to the format of 01/02/2017
		//  * param{Date}  input string
		//  * @returns {Date}} with the corresponding format
		//  */
		// dateTimeShortType: function(ddate) {
		// 	ddate = new sap.ui.model.type.Date({
		// 		pattern: "dd/MM/yyyy"
		// 	});
		// 	return ddate;
		// },

		// priorityValueConvert: function(value) {

		// 	switch (value) {
		// 		case "1":
		// 			return "green";
		// 		case "2":
		// 			return "yellow";
		// 		case "3":
		// 			return "red";
		// 		default:
		// 			return "blue";
		// 	}
		// },

	};
});