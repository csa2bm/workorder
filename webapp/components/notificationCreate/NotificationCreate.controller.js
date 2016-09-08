sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/Globalization",
	"sap/ui/core/routing/History"
], function(Controller, devApp, Globalization, History) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationCreate.NotificationCreate", {
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "notificationCreate") {
				//We navigated to another page
				return;
			}
		},

		goBack: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("dashboard", true);
			}
		},
		
		handleSaveNotification : function(){


			this.goBack();
		}
	});
});