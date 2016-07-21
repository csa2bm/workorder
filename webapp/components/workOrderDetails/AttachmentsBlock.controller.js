sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.AttachmentsBlock", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onInit: function() {
		//
		//	},

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

		clickPreviewAttachment: function(oEvent) {
			//self = this;
			var currentObject = oEvent.getSource().getBindingContext().getObject();

			// var localObjectUri = "";

			// if (currentObject) {

			// 	if (currentObject['@com.sap.vocabularies.Offline.v1.islocal']) {
			// 		var serviceUrl = oEvent.getSource().getModel().sServiceUrl;
			// 		localObjectUri = currentObject.__metadata.uri.replace(serviceUrl, "");
			// 	}
			// }
			
			window.open("data:image/jpeg;base64," + currentObject.Data, "_blank");
		}
	});
});