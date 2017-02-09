sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.operationDetails.blocks.OperationGeneralBlock", {
		opStatusIcon: function(sStatus) {
			if (sStatus) {
				return "sap-icon://circle-task-2"; 
			} else {
				return "sap-icon://circle-task";
			}
		}
	});
});