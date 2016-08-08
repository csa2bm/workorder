sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.OperationsBlock", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		onInit: function() {

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onExit: function() {
		//
		//	}

		gotoOperationDetailsPage: function(data) {

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("BlockNavigation", data);
		},

		onOperationItemPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			var data = {
				"block": "operation",
				"operationContext": oBindingContext.getPath().substr(1)
			};
			this.gotoOperationDetailsPage(data);
		},
		/**
		 * If operationStatus is true use icon
		 * param{Boolean} sStatus input string
		 * @returns {String}} for SAP icon
		 */
		operationStatus: function(sStatus) {
			if (sStatus) {
				return "sap-icon://accept";
			} else {
				return ""; // "sap-icon://message-warning";
			}
		},
		
		/**
		 * Based on the value of operationstatus use different colors
		 * param{Boolean} sStatus input string
		 * @returns {String}} for SAP icon color
		 */
		opStatusColor: function(sStatus) {
			if (sStatus) {
				return "Green";
			} else {
				return "Red";
			}
		}

	});

});