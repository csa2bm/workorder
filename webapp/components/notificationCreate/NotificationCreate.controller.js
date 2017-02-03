sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/Filter"
], function(Controller, History, MessageBox, Filter) {
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
			var isHybridApp = this.getView().getModel("device").getData().isHybridApp;
			if (isHybridApp) {
				cordova.plugins.barcodeScanner.scan(
					function(result) {
						if (result.cancelled) {
							return;
						} else {

							var scannedEquipmentId = result.text;
							var onDataReceived = {
								success: function(oData, oResponse) {
									var isFuncLoc = false;
									this.saveEquipmentToModel(oData, isFuncLoc);

								}.bind(this),
								error: function(oData, oResponse) {
									if (oData.statusCode === "404") {
										this.searchFuncLocWithId(scannedEquipmentId);
									} else {
										this.errorCallBackShowInPopUp();
									}
								}.bind(this)
							};
							this.getView().getModel().read("/EquipmentsSet('" + scannedEquipmentId + "')", onDataReceived);
						}

					}.bind(this));

			} else {
				this.showAlertNotDevice();
			}
		},
		saveEquipmentToModel: function(equipmentObject, isFuncLoc) {

			if (isFuncLoc) {
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FunctionalLoc", equipmentObject.FunctionalLocation);
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FuncLocDesc", equipmentObject.Description);
				
			} else {
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FunctionalLoc", equipmentObject.Funcloc);
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FuncLocDesc", equipmentObject.Funclocdesc);
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/Equipment", equipmentObject.Equipment);
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/EquipmentDesc", equipmentObject.Description);
			}

		},

		searchFuncLocWithId: function(equipId) {
			var onDataReceived = {
				success: function(oData, oResponse) {
					var isFuncLoc = true;
					this.saveEquipmentToModel(oData, isFuncLoc);
				}.bind(this),
				error: function(oData, oResponse) {
					if (oData.statusCode === "404") {
						this.showAlertNoObjectFound(equipId);

					} else {
						this.errorCallBackShowInPopUp();
					}
				}.bind(this)
			};

			this.getView().getModel().read("/FunctionalLocationsSet('" + equipId + "')", onDataReceived);
		},

		showAlertNoObjectFound: function(equipmentNo) {
			// Reset values if object was not found
			this.getView().getModel().setProperty(this.newEntry.getPath() + "/FunctionalLoc", "");
			this.getView().getModel().setProperty(this.newEntry.getPath() + "/FuncLocDesc", "");
			this.getView().getModel().setProperty(this.newEntry.getPath() + "/Equipment", "");
			this.getView().getModel().setProperty(this.newEntry.getPath() + "/EquipmentDesc", "");
			
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(this.getI18nTextReplace1("Dashboard-scanObjectTile-searchObjectNotFoundMsgText", equipmentNo), {
				icon: MessageBox.Icon.NONE,
				title: this.getI18nText("Dashboard-scanObjectTile-searchObjectNotFoundMsgTitleText"),
				actions: [MessageBox.Action.OK],
				defaultAction: MessageBox.Action.OK,
				styleClass: bCompact ? "sapUiSizeCompact" : ""
			});
		},

		showAlertNotDevice: function() {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(this.getI18nText("Dashboard-scanObjectTile-isNotDeviceMsgText"), {
				icon: MessageBox.Icon.NONE,
				title: this.getI18nText("Dashboard-scanObjectTile-isNotDeviceMsgTitleText"),
				actions: [MessageBox.Action.OK],
				defaultAction: MessageBox.Action.OK,
				styleClass: bCompact ? "sapUiSizeCompact" : ""
			});

		},

	});
});