sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
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

		clickPreviewAttachment: function(oEvent) {
			var currentObject = oEvent.getSource().getBindingContext().getObject();

			window.open("data:image/jpeg;base64," + currentObject.Data, "_blank");
		},

		capturePhoto: function() {
			self = this;
			var oNav = navigator.camera;
			oNav.getPicture(this.onPhotoCaptureSuccess,
				function() { //Nothing happens when cancel photo input
				}, {
					quality: 20,
					destinationType: oNav.DestinationType.DATA_URL, //Base64
					saveToPhotoAlbum: false,
					allowEdit: true
				});
		},

		onPhotoCaptureSuccess: function(file) {
			var orderNo = self.getView().getBindingContext().getObject().Orderid;

			var parameters = {
				success: function(oData, response) {
					var X = 0;
					self.getView().byId("attachmentsList").getBinding("items").refresh(true);
				},
				error: self.errorCallBackShowInPopUp
			};

			var dataCreate = {
				Orderid: orderNo,
				Data: file,
				CreateDate: new Date(),
				CreatedBy: "current user"
			};

			var createPath = "/OrderSet(Orderid='" + orderNo + "')/OrderAttachments";

			self.getView().getModel().create(createPath, dataCreate, parameters);
		}
	});
});