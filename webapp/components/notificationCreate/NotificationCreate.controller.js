sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/Globalization",
	"sap/ui/core/routing/History"
], function(Controller, devApp, Globalization, History) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationCreate.NotificationCreate", {
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
			
				this.ImageModel = new sap.ui.model.json.JSONModel();
			this.createAttachmentViewerPopover();
			
			
			//	this.setNotificationModel(this);
			this.NotificationCreateModel = new sap.ui.model.json.JSONModel({
				type: [{
					typeKey: 1 ,
					typeValue: ""
				},{
					typeKey: 2 ,
					typeValue: "Malfunction repair"
				},{
					typeKey: 3 ,
					typeValue: "Leak repair"
				}],
				priority: [{
					priorityKey: 1 ,
					priorityValue: "Medium"
				},{
					priorityKey: 2 ,
					priorityValue: "High"
				}]
			});
			this.getView().setModel(this.NotificationCreateModel, "NotificationCreateModel");
		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "notificationCreate") {
				//We navigated to another page
				return;
			}
		},

		goBack: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("dashboard", true);
			}
		},
		
		handleSaveNotification : function(){

			this.goBack();
		},
		
		imageDataToUrl: function(imageData) {
			return 'data:image/jpeg;base64,' + imageData;
		},
		itemFactory: function(sId, oContext) {
			var _self = this;
			var imageData = oContext.getProperty("Data");
			var image = new sap.m.Image();
			image.setSrc('data:image/jpeg;base64,' + imageData);
			image.setWidth("8em");
			image.setHeight("8em");
			image.addStyleClass("sapUiSmallMarginEnd");
			image.addStyleClass("sapUiSmallMarginTop");
			image.attachPress(function(oEvent) {
				_self.clickPreviewAttachment(oEvent);
			});

			return image;
		},
		capturePhoto: function() {
			self = this;
			var oNav = navigator.camera;
			oNav.getPicture(this.onPhotoCaptureSuccess,
				function() { //Nothing happens when cancel photo input
				}, {
					quality: 20,
					destinationType: oNav.DestinationType.DATA_URL, //Base64
					saveToPhotoAlbum: false
				});
		},

		onPhotoCaptureSuccess: function(file) {
			var orderNo = self.getView().getBindingContext().getObject().Orderid;

			var parameters = {
				success: function(oData, response) {
					var X = 0;
					self.getView().byId("attachmentsList").getBinding("items").refresh();
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
		},
		deleteAttachment: function(e) {
			var deletePath = e.getParameter('listItem').getBindingContext().getPath();

			var message = this.getI18nText("deleteAttachmentMessageText"); // + " " + e.getSource().getBindingContext().getObject().Filename;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			var that = this;
			sap.m.MessageBox.show(message, {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("deleteAttachmentMessageHeader"),
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {

						var oModel = that.getView().getModel();

						var parameters = {
							//context: context,
							eTag: "*",
							success: function(oData, response) {
								that.getView().byId("attachmentsList").getBinding("items").refresh(true);
							},
							error: this.errorCallBackShowInPopUp
						};

						oModel.remove(deletePath, parameters);
					}
				}
			});
		},
		onDeleteFile: function(oEvent) {
			var context = oEvent.getSource().getBindingContext();
			var message = this.getI18nText("deleteAttachmentMessageText");
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			var that = this;
			sap.m.MessageBox.show(message, {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("deleteAttachmentMessageHeader"),
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {

						var deletePath;

						var attachmentId = that._oPopover.getModel("ImageModel").getData().AttachmentID;
						if (attachmentId) {
							var orderNo = that._oPopover.getModel("ImageModel").getData().OrderNo;

							deletePath = "/AttachmentsSet(AttachmentID='" + attachmentId + "',Orderid='" + orderNo + "')";
						} else {
							//Local db object
							deletePath = that._oPopover.getModel("ImageModel").getData().LocalObjectUri;
						}

						var oModel = that.getView().getModel();

						var parameters = {
							context: context,
							eTag: "*",
							success: function(oData, response) {
								that.getView().byId("attachmentsList").getBinding("items").refresh(true);
							},
							error: that.errorCallBackShowInPopUp
						};

						oModel.remove(deletePath, parameters);

						that._oPopover.close();
					}
				}
			});
		},
		clickPreviewAttachment: function(oEvent) {
			self = this;
			var currentObject = oEvent.getSource().getBindingContext().getObject();

			var localObjectUri = "";

			if (currentObject) {

				if (currentObject['@com.sap.vocabularies.Offline.v1.islocal']) {
					var serviceUrl = oEvent.getSource().getModel().sServiceUrl;
					localObjectUri = currentObject.__metadata.uri.replace(serviceUrl, "");
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
			} else {
				//Seems sometimes we end up here - databinding not ready loaded??

				//sap.m.MessageBox.show("Not loaded in memory");
			}
		},

		createAttachmentViewerPopover: function() {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderDetails.fragments.AttachmentViewerPopover",
					this);

				this._oPopover.setModel(this.ImageModel, "ImageModel");

				//this._oPopover.attachAfterOpen(this.resizePopup);

				this._oPopover.attachBeforeClose(function() {
					//Just make sure that the control minimized
					//sap.ui.getCore().byId("popupImageControl").setWidth(null);
				});

				this.getView().addDependent(this._oPopover);
			}
		},

		resizePopup: function() {
			var popUpWidth = self._oPopover.$().width();
			var popUpHeight = self._oPopover.$().height();

			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;

	
		},

		closeAttachmentPopupButton: function() {
			if (this._oPopover) {
				this._oPopover.close();
			}
		},

		saveAttachmentButton: function() {

			var image = this._oPopover.getModel("ImageModel").getData().ImagePath;
			var attachmentId = this._oPopover.getModel("ImageModel").getData().AttachmentID;
			var orderNo = this._oPopover.getModel("ImageModel").getData().OrderNo;
			var localObjectUri = this._oPopover.getModel("ImageModel").getData().LocalObjectUri;

			var parameters = {
				success: function(oData, response) {
					var X = 0;
					self.getView().byId("attachmentsList").getBinding("items").refresh(true);

				},
				error: function(oError) {
					var X = 0;
				}
			};

			if (attachmentId || localObjectUri) {

				//Update existing attachment with new description
				var updateData = {
					Description: this._oPopover.getModel("ImageModel").getData().Description,
					IncludeInReport: this._oPopover.getModel("ImageModel").getData().IncludeInReport
				};

				var updatePath;

				if (localObjectUri !== "") {
					updatePath = localObjectUri;
				} else {
					updatePath = "/AttachmentsSet(AttachmentID='" + attachmentId + "',OrderNo='" + orderNo + "')";
				}

				self.getView().getModel().update(updatePath, updateData, parameters);
			} else {
				//Create new attachment

				var imageWithoutBase64Prefix = image.replace("data:image/jpeg;base64,", "");

				var dataCreate = {
					OrderNo: orderNo,
					Data: imageWithoutBase64Prefix,
					CreateDate: new Date(),
					CreatedBy: "current user",
					Description: this._oPopover.getModel("ImageModel").getData().Description,
					IncludeInReport: this._oPopover.getModel("ImageModel").getData().IncludeInReport
				};

				var createPath = "/OrderSet(OrderNo='" + orderNo + "')/Attachments";

				self.getView().getModel().create(createPath, dataCreate, parameters);
			}

			self._oPopover.close();
		},

		attachmentPopUpShowDeleteButton: function(attachmentID) {
			if (attachmentID === "") {
				return false;
			}
			return true;
		}
	});
});