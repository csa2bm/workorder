sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.WorkOrderDetails", {
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("workOrderDetails").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
		/*	var oView = this.getView();
			
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").workOrderContext,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function(oEvent) {
						oView.setBusy(true);
					},
					dataReceived: function(oEvent) {
						oView.setBusy(false);
					}
				}
				
				
			});
			*/
				//Are we navigating to this view??
			//if not do nothing

				var oArguments = oEvent.getParameter("arguments");
				var contextPath = '/' + oArguments.workOrderContext;
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
					//this.getEventBus().publish("ChecklistsUpdate");
					//this.getEventBus().publish("AttachmentsUpdate");

					//this.scrollToTop();
				} else {
					var that = this;
					//if not, create the binding context with all the expands we need in this view
					var aExpand = ["OrderOperation", "OrderComponent", "OrderObject", "OrderAttachments", "OrderGoodsMovements"];

					this.getView().getModel().createBindingContext(contextPath, "", {
							expand: aExpand.toString()
						},
						function(oEvent) {
							var f = oEvent;
							that.ExpandLoaded = true;

						}, true);
				}
		},
		
		
		_onBindingChange: function(oEvent) {
			// No data for the binding
			if (!this.getView().getBindingContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},
		
		onNavigationButtonPress: function(oEvent){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("workOrderList", true);
			}	
		}

	});
});