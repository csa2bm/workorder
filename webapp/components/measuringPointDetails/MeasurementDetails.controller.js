sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller, History, Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.measuringPointDetails.MeasurementDetails", {
		formatter:Formatter,
		
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},
		
		onRouteMatched: function(oEvent) {
			
			var oArguments = oEvent.getParameter("arguments");
			var contextPath = '/' + oArguments.measurementContext;
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
				
				if (!this.getView().getBindingContext()) {
					this.scrollToTop();
				}
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
				var aExpand = ["MeasPointMeasDoc"];

				this.getView().getModel().createBindingContext(contextPath, "", {
						expand: aExpand.toString()
					},
					function(oEvent) {
						var f = oEvent;
						that.ExpandLoaded = true;

					}, true);
			}

		},
		
		onNavigationButtonPress: function(oEvent){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("workOrderDetails", false);
			}	
		},
		scrollToTop: function() {
			var generalSection = this.getView().byId("generalSectionId").getId();
			if (generalSection) {
				this.getView().byId("MeasuringObjectPageId").scrollToSection(generalSection, 0, -500);
			}
		}
	});
});