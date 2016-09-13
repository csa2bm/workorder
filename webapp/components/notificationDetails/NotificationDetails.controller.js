sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.NotificationDetails", {
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("notificationDetails").attachMatched(this._onRouteMatched, this);

			//Subscribe to connection events
			var eventBus = this.getEventBus();
			eventBus.subscribe("BlockNavigation", this.performNavigationForBlocks, this);
		},
		_onRouteMatched: function(oEvent) {

			var oArguments = oEvent.getParameter("arguments");
			var contextPath = '/' + oArguments.notificationContext;
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

		_onBindingChange: function(oEvent) {
			// No data for the binding
			if (!this.getView().getBindingContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},

		onNavigationButtonPress: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("notificationList", true);
			}
		},
		isNotificationNotCompleted: function(sString) {
			if (sString === this.getI18nText("notificationStatusCompleted")) {
				return false;
			} else {
				return true;
			}
		},
		editNotificationPressed: function() {

		}

	});
});