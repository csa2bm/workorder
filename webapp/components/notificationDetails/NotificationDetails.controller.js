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
			eventBus.subscribe("BlockNavigationNotification", this.performNavigationForBlocks, this);
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
		
		performNavigationForBlocks: function(a, b, data){
			
			if ('item'.localeCompare(data.block) === 0) {
				this.getRouter().navTo("itemDetails", {
					itemContext: data.itemContext
				}, false);
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
		
		isInErrorStateWorkNotification: function(errorsArray, notificationId) {
			if ($.inArray(notificationId, errorsArray) >= 0) {
				return true;
			} else {
				return false;
			}
		},
		
		openErrorsForNotification : function(oEvent){
			var notifNo = oEvent.getSource().getBindingContext().getObject().NotifNo;

			this.getView().getModel("syncStatusModel").getData().ErrorListContextObject = "Notification";
			this.getView().getModel("syncStatusModel").getData().ErrorListContextID = notifNo;
			this.getView().getModel("syncStatusModel").refresh();

			if (!this._errorsView) {

				var idPrefix = this.getView().createId("errorList");
				var controller = sap.ui.controller("com.twobm.mobileworkorder.components.offline.ErrorListControl");
				this._errorsView = sap.ui.xmlfragment(idPrefix,
					"com.twobm.mobileworkorder.components.offline.fragments.ErrorsListPopover", controller);
				this._errorsView.setModel(this.getView().getModel());
				controller.dialog = this._errorsView;
				controller.idPrefix = idPrefix;
				this.getView().addDependent(this._errorsView);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			// var oButton = oEvent.getSource();
			// jQuery.sap.delayedCall(0, this, function() {
			this._errorsView.open();
		}
	});
});