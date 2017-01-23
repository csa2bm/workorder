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
			var oArguments = oEvent.getParameter("arguments");
			if (oArguments.argAvailable) {
				if (oArguments.equipmentNo !== "NONE" && oArguments.equipmentDesc !== "NONE") {
					this.getView().getModel().setProperty(this.newEntry.getPath() + "/Equipment", oArguments.equipmentNo);
					this.getView().getModel().setProperty(this.newEntry.getPath() + "/EquipmentDesc", oArguments.equipmentDesc);
				}
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FuncLocDesc", oArguments.funcLocDesc);
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FunctionalLoc", oArguments.functionalLoc);

			}

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
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

		/*
				handleValueHelpFunctionalLocation: function(oEvent) {
					var sInputValue = oEvent.getSource().getValue();

					this.inputId = oEvent.getSource().getId();

					if (!this._valueHelpFunctionalLocationDialog) {
						this._valueHelpFunctionalLocationDialog = sap.ui.xmlfragment(
							"com.twobm.mobileworkorder.components.notificationCreate.fragments.FunctionalLocation",
							this
						);
						this.getView().addDependent(this._valueHelpFunctionalLocationDialog);
					}

					// create a filter for the binding
					this._valueHelpFunctionalLocationDialog.getBinding("items").filter([new Filter(
						"FunctionalLocation",
						sap.ui.model.FilterOperator.Contains, sInputValue
					)]);

					// open value help dialog filtered by the input value
					this._valueHelpFunctionalLocationDialog.open(sInputValue);
				},

				handleValueHelpEquipment: function(oEvent) {
					var sInputValue = oEvent.getSource().getValue();

					this.inputId = oEvent.getSource().getId();

					if (!this._valueHelpEquipmentDialog) {
						this._valueHelpEquipmentDialog = sap.ui.xmlfragment(
							"com.twobm.mobileworkorder.components.notificationCreate.fragments.Equipment",
							this
						);
						this.getView().addDependent(this._valueHelpEquipmentDialog);
					}

					// create a filter for the binding
					this._valueHelpEquipmentDialog.getBinding("items").filter([new Filter(
						"Equipment",
						sap.ui.model.FilterOperator.Contains, sInputValue
					)]);

					// open value help dialog filtered by the input value
					this._valueHelpEquipmentDialog.open(sInputValue);
				},
				*/

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

		_handleValueHelpCloseFunctionalLocation: function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.getView().byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/FuncLocDesc", oSelectedItem.getDescription());
			}
			evt.getSource().getBinding("items").filter([]);
			//var thisDialog = evt.getParameter("id");
			//thisDialog.close();
		},

		_handleValueHelpCloseEquipment: function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.getView().byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
				this.getView().getModel().setProperty(this.newEntry.getPath() + "/EquipmentDesc", oSelectedItem.getDescription());

			}
			evt.getSource().getBinding("items").filter([]);
			//var thisDialog = evt.getParameter("id");
			//thisDialog.close();
		},

		_handleValueHelpAfterClose: function(evt) {
			//Destroy the ValueHelpDialog
			var thisDialog = evt.getParameter("id");
			//this._valueHelpDialog.destroy();
			thisDialog.destroy();
		},
		onSelectBtnPress: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("structureBrowser", {
				notificationContext: this.newEntry.getPath().substr(1),
				parentView: "notificationCreate"
			}, false);
		},
		onScanBtnPress: function() {
			var that = this;
			var code = "";
			try {
				cordova.plugins.barcodeScanner.scan(
					function(result) {

						if (result.cancelled) {
							sap.m.MessageToast.show("Canelled");
							return;
						}

						// set functional location and equipent to model and refresh model
						//localmodel.refresh();

					},
					function(error) {
						sap.m.MessageToast.show("Scanning failed: " + error);
					}
				);
			} catch (err) {
				console.log(err);
			}
		}
	});
});