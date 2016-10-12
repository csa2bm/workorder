sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/Globalization",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/Filter"
], function(Controller, devApp, Globalization, History, MessageBox, Filter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationCreate.NotificationCreate", {
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

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
			jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {
				this.getView().setBindingContext(this.getView().getModel().createEntry("/NotificationsSet"));
			}, this));
		},

		goBack: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getView().setBindingContext(null);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("dashboard", true);
			}
		},

		handleSaveNotification: function() {
			this.getView().setBusy(true);

			var model = this.getView().getModel();
			var data = model.getData(this.getView().getBindingContext().getPath());
			model.create("/NotificationsSet", data, {
				success: jQuery.proxy(function(oData, oResponse) {
					this.getView().setBusy(false);

					if (oData && oData.__metadata && oData.__metadata.id) {
						var idx = oData.__metadata.id.lastIndexOf("/");
						var bindingPath = oData.__metadata.id.substring(idx);
						this.getRouter().navTo("notificationDetails", {
							notificationContext: bindingPath.substr(1)
						}, true);
					}

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
			var thisDialog = evt.getParameter("id");
			thisDialog.close();
		},
		
		_handleValueHelpAfterClose: function(evt) {
			//Destroy the ValueHelpDialog
			var thisDialog = evt.getParameter("id");
			//this._valueHelpDialog.destroy();
			thisDialog.destroy();
		}
	});
});