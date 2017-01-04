sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Globalization",
	"com/twobm/mobileworkorder/util/Formatter",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/components/offline/SyncStateHandler",
	"com/twobm/mobileworkorder/components/offline/SyncManager"
], function(Controller, Globalization, Formatter, History, SyncStateHandler, SyncManager) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationList.NotificationList", {
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "notificationList") {
				return;
			}

			this.setInitialSorting();
		},

		onNavigationButtonPress: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("dashboard", true);
			}
		},

		onNotificationItemPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			this.getRouter().navTo("notificationDetails", {
				notificationContext: oBindingContext.getPath().substr(1)
			});
		},

		// Pop-up for sorting and filter
		handleViewSettingsDialogButtonPressed: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationList.controls.NotificationFilterDialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		setInitialSorting: function() {
			var oTable = this.getView().byId("notificationTableId");
			var oBinding = oTable.getBinding("items");

			var aSorters = [];

			var sortItem = "NotifDate";
			var sortDescending = true;
			aSorters.push(new sap.ui.model.Sorter(sortItem, sortDescending));
			oBinding.sort(aSorters);
		},

		// Start filter and sorting based on selected.
		handleNotificationFilterConfirm: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("notificationTableId");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var aSorters = [];
			if (mParams.groupItem) {
				var sPath = mParams.groupItem.getKey();
				var bDescending = mParams.groupDescending;
				var vGroup = this.orderGroupFunctions[sPath];
				aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
			}

			var sortItem = mParams.sortItem.getKey();
			var sortDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sortItem, sortDescending));
			oBinding.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			oBinding.filter(aFilters);

			var model = this.getView().getModel();
			model.refresh();
		},

		closeSyncPopup: function() {
			if (this._syncQuickView) {
				this._syncQuickView.close();
			}
		},

		createNewNotification: function() {
			var oRouter = this.getRouter();
			oRouter.navTo("notificationCreate", true);
		},

		priorityValueConvert: function(value) {
			switch (value) {
				case "1":
					return "black";
				case "2":
					return "blue";
				case "3":
					return "red";
				default:
					return "grey";
			}
		},

		openErrorsView: function(oEvent) {
			if (!this._errorsView) {
				this._errorsView = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.app.fragments.ErrorsListPopover", this);
				this.getView().addDependent(this._errorsView);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			//var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._errorsView.open();
			});
		},

		closeErrorListPopupButton: function() {
			if (this._errorsView) {
				this._errorsView.close();
			}
		},

		isInErrorStateNotification: function(errorsArray, notificationId) {
			//console.log("isInErrorStateNotification");

			if ($.inArray(notificationId, errorsArray) >= 0) {
				return true;
			} else {
				return false;
			}
		},
		
		isOnline: function(){
			if (sap.hybrid)
			{
				return false;
			}
			
			return true;
		},
		
		onRefresh: function()
		{
			this.getView().getModel().refresh();
		}
	});
});