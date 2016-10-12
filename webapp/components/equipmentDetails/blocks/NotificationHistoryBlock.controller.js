sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller,Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.equipmentDetails.blocks.NotificationHistoryBlock", {
		formatter:Formatter
	
	});
});