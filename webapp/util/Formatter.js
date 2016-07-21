sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Upper the first character of giving string
		 * param{String} sStr input string
		 * @returns {String}} the input string with the first uppercase character
		 */
		uppercaseFirstChar: function(sStr) {
			return sStr.charAt(0).toUpperCase() + sStr.slice(1);
		},

		/**
		 * Returns false if a string is empty
		 * param{String} sStr input string
		 * @returns {Boolean}} false if the input string is empty
		 */
		isNotEmptyStr: function(sStr) {
			if (!sStr || sStr === "") {
				return false;
			} else {
				return true;
			}
		},
		
		/**
		 * If operationStatus is true use icon
		 * param{Boolean} sStatus input string
		 * @returns {String}} for SAP icon
		 */
		operationStatus: function(sStatus) {
			if (sStatus) {
				return "sap-icon://accept";
			} else {
				return ""; // "sap-icon://message-warning";
			}
		},
		
		/**
		 * Based on the value of operationstatus use different colors
		 * param{Boolean} sStatus input string
		 * @returns {String}} for SAP icon color
		 */
		opStatusColor: function(sStatus) {
			if (sStatus) {
				return "Green";
			} else {
				return "Red";
			}
		},
		
		/**
		 * Convert type date to the format of 01/02/2017
		 * param{Date}  input string
		 * @returns {Date}} with the corresponding format
		 */
		dateTimeShortType: function() {
		var dateType = new sap.ui.model.type.Date({
			pattern: "dd/MM/yyyy"
		});
		return dateType;
	}
	};
});