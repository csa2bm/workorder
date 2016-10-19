sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller, Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.blocks.GeneralBlock", {
		formatter: Formatter,

		formatPriorityText: function(priority) {
			switch (priority) {
				case "1":
					return "Low";
				case "2":
					return "Medium";
				case "3":
					return "High";
			}
			return "None";
		}
	});
});