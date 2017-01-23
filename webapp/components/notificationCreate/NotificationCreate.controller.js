sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Globalization",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/Filter"
], function(Controller, Globalization, History, MessageBox, Filter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationCreate.NotificationCreate", {
		onInit: function() {
			this.getRouter().getRoute("notificationCreate").attachMatched(this.onRouteMatched, this);

			//	Notification popUps
			this.NotificationDropdownsModel = new sap.ui.model.json.JSONModel({
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

			var direction = sap.ui.core.routing.History.getInstance().getDirection();

			if (direction !== "Backwards") {

				this.newEntry = this.getView().getModel().createEntry("/NotificationsSet", {
					properties: {
						NotifDate: new Date().toISOString().substr(0, 19)
					},
					success: jQuery.proxy(function(oData, oResponse) {
						this.getView().setBusy(false);
						this.getRouter().navTo("notificationDetails", {
							notificationContext: this.newEntry.getPath().substr(1)
						}, true);

					}, this),
					error: jQuery.proxy(function(error) {
						if (error.statusCode === 0) {
							return;
						}

						this.getView().setBusy(false);
						this.errorCallBackShowInPopUp(error);
					}, this)
				});
			}

			var selectObjectForNewNotificationModel = this.getView().getModel("selectObjectForNewNotificationModel");

			if (!jQuery.isEmptyObject(selectObjectForNewNotificationModel.getData())) {
				if (selectObjectForNewNotificationModel.getData().equipmentNo !== "NONE" && selectObjectForNewNotificationModel.getData().equipmentDesc !==
					"NONE") {
					this.getView().getModel().setProperty(this.newEntry.getPath() + "/Equipment", selectObjectForNewNotificationModel.getData().equipmentNo);
					this.getView().getModel().setProperty(this.newEntry.getPath() + "/EquipmentDesc", selectObjectForNewNotificationModel.getData().equipmentDesc);
				}
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FuncLocDesc", selectObjectForNewNotificationModel.getData().funcLocDesc);
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FunctionalLoc", selectObjectForNewNotificationModel.getData().functionalLoc);
			}
			// var oArguments = oEvent.getParameter("arguments");
			// if (oArguments.argAvailable) {
			// 	if (oArguments.equipmentNo !== "NONE" && oArguments.equipmentDesc !== "NONE") {
			// 		this.getView().getModel().setProperty(this.newEntry.getPath() + "/Equipment", oArguments.equipmentNo);
			// 		this.getView().getModel().setProperty(this.newEntry.getPath() + "/EquipmentDesc", oArguments.equipmentDesc);
			// 	}
			// 	this.getView().getModel().setProperty(this.newEntry.getPath() + "/FuncLocDesc", oArguments.funcLocDesc);
			// 	this.getView().getModel().setProperty(this.newEntry.getPath() + "/FunctionalLoc", oArguments.functionalLoc);
			// }

			//var oHistory = History.getInstance();
			//var sPreviousHash = oHistory.getPreviousHash();
			/*
						var str = "struct"; // structure browser
						if (sPreviousHash !== undefined) {
							if (sPreviousHash.substring(0, str.length) === str) {
								oHistory.aHistory.pop();
							} else {
								for (var i = 0; i < oHistory.aHistory.length; i++) {
									var strStructure = "struct";

									if (oHistory.aHistory[i].substring(0, strStructure.length) === strStructure) {
										oHistory.aHistory.splice(i, 1);
									} else if (oHistory.aHistory[i].substring(0, str.length) === str) {
										oHistory.aHistory.splice(i, 1);
									}
								}
							}
						}*/
			this.getView().setBindingContext(this.newEntry);
		},

		goBack: function(oEvent) {
			//Reset create notification model
			var selectObjectForNewNotificationModel = this.getView().getModel("selectObjectForNewNotificationModel");
			selectObjectForNewNotificationModel.setData({});

			//Delete created entry
			this.getView().getModel().deleteCreatedEntry(this.getView().getBindingContext());

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getView().setBindingContext(null);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("dashboard", true);
			}
		},

		handleSaveNotification: function() {

			if (!this.getView().getBindingContext().getObject().ShortText) {
				sap.m.MessageToast.show("Description missing");
				return;
			}

			if (!this.getView().getBindingContext().getObject().LongText) {
				sap.m.MessageToast.show("Notes missing");
				return;
			}

			this.getView().setBusy(true);
			this.getView().getModel().submitChanges({
				success: jQuery.proxy(function(oData, oResponse) {
					this.getView().setBusy(false);
				}, this),
				error: jQuery.proxy(function(error) {
					this.getView().setBusy(false);
					this.errorCallBackShowInPopUp(error);
				}, this)
			});
		},

		priorityValueConvert: function(value) {

			switch (value) {
				case "Low":
					return 1;
				case "Medium":
					return 2;
				case "High":
					return 3;
				default:
					return null;
			}
		},

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

		onSelectBtnPress: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("structureBrowser", {
				notificationContext: this.newEntry.getPath().substr(1),
				parentView: "notificationCreate"
			}, false);
		},

		onScanBtnPress: function() {
			cordova.plugins.barcodeScanner.scan(
				function(result) {
					if (result.cancelled === "true") {
						return;
					}

					// var materialDetailsModel = self.getView().getModel("MaterialDetailsModel");
					// materialDetailsModel.getData().OrderNumber = orderNr;
					// materialDetailsModel.refresh();

					// self.searchForMaterial(result.text);
				},
				function() {
					sap.m.MessageToast.show("Scanning failed");
				}
			);
		}
	});
});