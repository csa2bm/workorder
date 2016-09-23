sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/Globalization",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	'sap/ui/core/Fragment'
], function(Controller, devApp, Globalization, History, MessageBox, Filter, Fragment) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationCreate.NotificationCreate", {
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

			this.ImageModel = new sap.ui.model.json.JSONModel();
			this.createAttachmentViewerPopover();

			//	Notification popUps
			this.NotificationDropdownsModel = new sap.ui.model.json.JSONModel({

				type: [{
					typeKey: 1,
					typeValue: ""
				}, {
					typeKey: 2,
					typeValue: "Malfunction repair"
				}, {
					typeKey: 3,
					typeValue: "Leak repair"
				}, {
					typeKey: 4,
					typeValue: "periodic Maintenance"
				}],
				priority: [{
					priorityKey: 1,
					priorityValue: "Low"
				}, {
					priorityKey: 2,
					priorityValue: "Medium"
				}, {
					priorityKey: 3,
					priorityValue: "High"
				}]
			});

			this.getView().setModel(this.NotificationDropdownsModel, "NotificationDropdownsModel");
		},

		onRouteMatched: function(oEvent) {
			var oParameters = oEvent.getParameters();

			/*	var parametersNotif = {
					success: function(oData, oResponse) {

						self.DashBoardModel.getData().notificationCount = oData;
						self.DashBoardModel.refresh();

					},
					error: this.errorCallBackShowInPopUp
				};

		
				this.getView().getModel().read("/NotificationsSet/$metadata", parametersNotif);*/

			jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {
				var oView = this.getView();

				// when detail navigation occurs, update the binding context
				if (oParameters.name !== "notificationCreate") {
					return;
				}

				//	var oArguments = oEvent.getParameter("arguments");
				//	var contextPath = '/' + oArguments.workOrderContext;

				//var sEntityPath = "/" + oParameters.arguments.entity;

				var sEntityPath = "/NotificationsSet";

				//	if (oParameters.arguments.tab === "AddItem") {
				var model = this.getView().getModel();
				//	var newEntry = model.createEntry(sEntityPath);
				var newEntry = model.createEntry(sEntityPath);

				model.newEntryContext = newEntry;
				//clean bounded data object
				oView.unbindObject();
				//now set new binding context
				oView.setBindingContext(newEntry);
				/*	} else {
						this.switchMode(this._sMode);
						this.bindView(sEntityPath);

						var oIconTabBar = sap.ui.core.Fragment.byId(this._fragmentName, "idIconTabBar");
						if (oIconTabBar) {
							oIconTabBar.getItems().forEach(function(oItem) {
								oItem.bindElement(Formatter.uppercaseFirstChar(oItem.getKey()));
							});

							// Which tab?
							var sTabKey = oParameters.arguments.tab;
							this.getEventBus().publish("Detail", "TabChanged", {
								sTabKey: sTabKey
							});

							if (oIconTabBar.getSelectedKey() !== sTabKey) {
								oIconTabBar.setSelectedKey(sTabKey);
							}
						}
					}*/
			}, this));
		},

		goBack: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getView().setBindingContext(null);
			//	this.getView().unbindObject();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("dashboard", true);
			}
		},

		/**
		 * detai view save button handler
		 */
		handleSaveNotification: function() {
			var model = this.getView().getModel();
			
		
			model.newEntryContext.getProperty().Priority = this.priorityValueConvert(model.newEntryContext.getProperty().Priority);
			
			//if (model.hasPendingChanges() || model.newEntryContext) {
			if (model.newEntryContext) {
				this.getView().setBusy(true);

				model.submitChanges(
					jQuery.proxy(function(oData, oResponse) {
						this.getView().setBusy(false);
						this.openDialog("i18n>saveSuccess");
						this.switchMode("read");
						if (oResponse && oResponse.statusCode === 201) { // 201 == Created
							/*	if (oData && oData.__metadata && oData.__metadata.id) {
									var idx = oData.__metadata.id.lastIndexOf("/");
									var bindingPath = oData.__metadata.id.substring(idx);
									this.getRouter().navTo("detail", {
										entity: bindingPath.substr(1)
									}, true);
								}*/
							this.goBack();
						}
					}, this),
					jQuery.proxy(function(error) {
						this.getView().setBusy(false);
						//this.openDialog("i18n>saveFailed");
						var msg = error;
						if (typeof(error) === "object" && error.response && error.response.body) {
							msg = error.response.body;
						}
						this._showServiceError(msg);
					}, this)
				);
				this.goBack();
			}
		},
			priorityValueConvert: function(value) {
		
			switch (value) {
				case "Low":
					return 1;
				case  "Medium":
					return 2;
				case  "High":
					return 3 ;
				default:
					return null;
			}
				
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
					//var X = 0;
					self.getView().byId("attachmentsList").getBinding("items").refresh(true);

				},
				error: function(oError) {
					//	var X = 0;
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
		},
		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showServiceError: function(sDetails) {
			MessageBox.error(
				this._sErrorText, {
					id: "serviceErrorMessageBox",
					details: sDetails,
					styleClass: this.getOwnerComponent().getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE]
				}
			);
		},

		handleValueHelpFunctionalLocation: function(oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			var x = 0;
			// create value help dialog
	/*		if (this._valueHelpDialog) {
				this._valueHelpDialog.destroy();
			}*/
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"com.twobm.mobileworkorder.components.notificationCreate.fragments.FunctionalLocation",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"FunctionalLocation",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

		handleValueHelpEquipment: function(oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			var x = 0;
			// create value help 
		/*	if (this._valueHelpDialog) {
				this._valueHelpDialog.destroy();
			}*/
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"com.twobm.mobileworkorder.components.notificationCreate.fragments.Equipment",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"Equipment",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

		_handleValueHelpSearchFunctionalLocation: function(evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"FunctionalLocation",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpSearchEquipment: function(evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Equipment",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose: function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.getView().byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
			var thisDialog=evt.getParameter("id");
			 thisDialog.close();
		

		},
		  _handleValueHelpAfterClose : function(evt){
             //Destroy the ValueHelpDialog
             var thisDialog=evt.getParameter("id");
             //this._valueHelpDialog.destroy();
             thisDialog.destroy();
            
         },
         
         orderStatusValid: function(str){
			
			return true;
		}
	});
});
