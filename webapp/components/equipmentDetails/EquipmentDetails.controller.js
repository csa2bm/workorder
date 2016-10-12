sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller, History, Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.equipmentDetails.EquipmentDetails", {
		formatter:Formatter,
		
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},
		
		onRouteMatched: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			var contextPath = '/' + oArguments.equipmentContext;
			var givenContext = new sap.ui.model.Context(this.getView().getModel(), contextPath);
			
			//this.oContext is the current context of the view
			//this context is the context that was set when the view was shown the last time
			//therefore the new contextPath can be different from the contextPath/context
			//that was shown the last time the view was shown
			if (!this.getView().getBindingContext() || this.getView().getBindingContext().getPath() !== contextPath) {
				//Reset model to the new context
				this.ExpandLoaded = false;
				//this.oContext = givenContext;
				this.getView().setBindingContext(givenContext);
				this.getView().bindElement(contextPath);
			}
		},
		
		onNavigationButtonPress: function(){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("workOrderDetails", false);
			}	
		},
		
		onPressCreateNotification: function() {

		var oRouter = this.getRouter();
			oRouter.navTo("notificationCreate", true);
		}
	});
});