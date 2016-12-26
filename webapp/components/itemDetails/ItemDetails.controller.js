sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller, History, Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.objectDetails.ObjectDetails", {
		formatter:Formatter,
		
		onInit: function() {
			//this.getRouter("objectDetails").attachMatched(this.onRouteMatched, this);
			this.getRouter().getRoute("objectDetails").attachMatched(this.onRouteMatched, this);

		},
		
		onRouteMatched: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			var contextPath = '/' + oArguments.objectContext;
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
			
			//do we have this context loaded in our model? We should always have a timeregistration entry
			if (this.ExpandLoaded) { //this.getView().getBindingContext().getObject()) {

				//if yes, refresh the model to reflect in memory model any changes done remotely to the order
				this.getView().getBindingContext().getModel().refresh(); //using true as argument got strange errors to arise

				//Update lists
				//Fix to get the lists to update after coming back to page with the same context


				//this.scrollToTop();
			} else {
				var that = this;
				//if not, create the binding context with all the expands we need in this view
				var aExpand = ["ObjectMeasurementPoint", "HistoricOrderSet", "HistoricNotifSet"];

				this.getView().getModel().createBindingContext(contextPath, "", {
						expand: aExpand.toString()
					},
					function(oEvent2) {
						that.ExpandLoaded = true;

					}, true);
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
		
		//Getting object of currently selected object in this view
		var object = this.getView().getBindingContext().getObject();
		// creating a data to pass functional location no. and equipment no of current object.
		
		//var path = this.getView().getBindingContext().getPath().substr(1);
		
		oRouter.navTo("notificationCreate", {
					equipmentNo: object.Equipment,
					functionalLoc: object.FunctLoc,
					argAvailable:"true"
				}, false);
		}
	});
});