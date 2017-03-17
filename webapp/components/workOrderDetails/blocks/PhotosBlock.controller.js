sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.blocks.PhotosBlock", {

		onInit: function() {
			this.ImageModel = new sap.ui.model.json.JSONModel();
			this.createPhotoViewerPopover();
		},

		itemFactory: function(sId, oContext) {
			var imageData = oContext.getProperty("Data");
			var image = new sap.m.Image();
			image.setSrc('data:image/jpeg;base64,' + imageData);
			image.setWidth("8em");
			image.setHeight("8em");
			image.addStyleClass("sapUiSmallMarginEnd");
			image.addStyleClass("sapUiSmallMarginTop");
			image.attachPress(function(oEvent) {
				this.clickPreviewPhoto(oEvent);
			}.bind(this));

			return image;
		},

		capturePhoto: function() {
			var oNav = navigator.camera;
			if (oNav) {
				oNav.getPicture(function(file) {
						var parameters = {
							success: function(oData, response) {
								this.getView().byId("attachmentsList").getBinding("items").refresh();
							}.bind(this),

							error: function(error) {
								this.errorCallBackShowInPopUp(error);
							}.bind(this)

						};

						var dataCreate = {
							Orderid: this.getView().getBindingContext().getObject().Orderid,
							Data: file,
							CreateDate: new Date(),
							CreatedBy: this.getView().getModel("appInfoModel").getData().UserFullName
						};

						var createPath = this.getView().getBindingContext().getPath() + "/OrderAttachments";

						this.getView().getModel().create(createPath, dataCreate, parameters);
					}.bind(this),
					function() { //Nothing happens when cancel photo input
					}, {
						quality: 20,
						destinationType: oNav.DestinationType.DATA_URL, //Base64
						saveToPhotoAlbum: false
					});
			} else {
				sap.m.MessageToast.show(this.getI18nText("WorkOrderDetails-CameraNotAvailable"));
			}
		},

		captureVideo: function() {
			navigator.device.capture.captureVideo(
				function captureSuccess(s) {
					console.log("Success");
				},
				function captureError(e) {
					console.log("capture error: " + JSON.stringify(e));
				}, {
					limit: 1
				});
		},

		onDeletePhoto: function(oEvent) {
			var context = oEvent.getSource().getBindingContext();
			var message = this.getI18nText("WorkOrderDetails-DeletePhotoMessageText");
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			sap.m.MessageBox.show(message, {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("WorkOrderDetails-DeletePhotoMessageHeader"),
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {

						var deletePath;

						if (this._oPopover.getModel("ImageModel").getData().LocalObjectUri) {
							//Local db object
							deletePath = this._oPopover.getModel("ImageModel").getData().LocalObjectUri;
						} else {
							var orderNo = this._oPopover.getModel("ImageModel").getData().OrderNo;
							var attachmentId = this._oPopover.getModel("ImageModel").getData().AttachmentID;
							// 
							deletePath = "/AttachmentsSet(AttachmentID='" + attachmentId + "',Orderid='" + orderNo + "')";
						}

						var parameters = {
							context: context,
							eTag: "*",
							success: function(oData, response) {
								this.getView().byId("attachmentsList").getBinding("items").refresh(true);
							}.bind(this),
							error: function(error) {
								this.errorCallBackShowInPopUp(error);
							}.bind(this)

						};

						this.getView().getModel().remove(deletePath, parameters);

						this._oPopover.close();
					}
				}.bind(this)
			});
		},

		clickPreviewPhoto: function(oEvent) {
			var currentObject = oEvent.getSource().getBindingContext().getObject();

			var localObjectUri = "";

			if (currentObject) {
				if (currentObject['@com.sap.vocabularies.Offline.v1.islocal']) {
					//var serviceUrl = oEvent.getSource().getModel().sServiceUrl;
					localObjectUri = oEvent.getSource().getBindingContext().getPath();
				}

				this._oPopover.getModel("ImageModel").setData({
					ImageHeight: window.innerHeight - 300 + "px",
					ImagePath: "data:image/jpeg;base64," + currentObject.Data,
					OrderNo: currentObject.Orderid,
					AttachmentID: currentObject.AttachmentID,
					Description: currentObject.Description,
					IncludeInReport: currentObject.IncludeInReport,
					LocalObjectUri: localObjectUri
				});
				this._oPopover.getModel("ImageModel").refresh();

				this._oPopover.open();
			}
		},

		createPhotoViewerPopover: function() {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderDetails.fragments.PhotoViewerPopover",
					this);

				this._oPopover.setModel(this.ImageModel, "ImageModel");
				this._oPopover.attachBeforeClose(function() {});

				this.getView().addDependent(this._oPopover);
			}
		},

		closePhotoPopupButton: function() {
			if (this._oPopover) {
				this._oPopover.close();
			}
		},

		photoPopUpShowDeleteButton: function(attachmentID) {
			if (attachmentID === "") {
				return false;
			}
			return true;
		},

		orderStatusValid: function(str) {
			var oContext = this.getView().getBindingContext();
			var model = this.getView().getModel();

			return !this.readOnly(oContext, model);
		}
	});
});