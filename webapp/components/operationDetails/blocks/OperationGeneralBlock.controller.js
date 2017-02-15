sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.operationDetails.blocks.OperationGeneralBlock", {
		onInit: function() {
		},
		
		opStatusIcon: function(sStatus) {
			if (sStatus) {
				return "sap-icon://circle-task-2"; 
			} else {
				return "sap-icon://circle-task";
			}
		},
		checkResponibleValid: function(responsible){
			var responsibleIntValue = parseInt(responsible);
			if(responsibleIntValue !== 0){
				return responsible;
			}
		},
		getFullname:function(fullname, username){
			if(fullname){
				return fullname + " (" + username + ")";
			}
			else{
				return this.getI18nText("WorkOrderDetails-OperationBlock-NoResponsibleAssigned");
			}
		}
	});
});