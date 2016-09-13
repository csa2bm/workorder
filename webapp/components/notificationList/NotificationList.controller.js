sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/Globalization",
	"com/twobm/mobileworkorder/util/Formatter",
	"sap/ui/core/routing/History"
], function(Controller, devApp, Globalization, Formatter, History) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationList.NotificationList", {
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "notificationList") {
				//We navigated to another page - unsubscribe to events for this page
				this.getEventBus().unsubscribe("OfflineStore", "Synced", this.syncCompleted, this);
				this.getEventBus().unsubscribe("DeviceOnline", this.deviceWentOnline, this);
				this.getEventBus().unsubscribe("DeviceOffline", this.deviceWentOffline, this);
				return;
			}

			self = this;

			this.getEventBus().subscribe("OfflineStore", "Synced", this.syncCompleted, this);
			this.getEventBus().subscribe("DeviceOnline", this.deviceWentOnline, this);
			this.getEventBus().subscribe("DeviceOffline", this.deviceWentOffline, this);

			this.getEventBus().publish("UpdateSyncState");

			this.setInitialSorting();

			//flush and refresh data
			this.refresh();
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

			var sortItem = "Priority";
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

			// update filter bar
			//oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			//oView.byId("vsdFilterLabel").setText(mParams.filterString);

			var model = this.getView().getModel();
			model.refresh();
		},

		refresh: function() {
			//Subscribe to sync events
			if (window.sap_webide_FacadePreview) {
				//model.attachRequestCompleted(this.syncCompleted);
				//model.attachRequestFailed(this.syncFailed);
				this.subscribeToOnlineSyncEvents();
			} else {
				//When not in webide 
			}

			this.refreshData();
		},

		//These event are event from the odata service
		//In offline scenario we are not interesting in these
		//as it is more important that the data has been synced to the backend
		subscribeToOnlineSyncEvents: function() {
			//subscribe to sync events
			self.getView().getModel().attachRequestCompleted(self.syncCompleted);
			self.getView().getModel().attachRequestFailed(self.syncFailed);
		},

		unSubscribeToOnlineSyncEvents: function() {
			//Unsubscribe to sync events
			self.getView().getModel().detachRequestCompleted(self.syncCompleted);
			self.getView().getModel().detachRequestFailed(self.syncFailed);
		},

		syncCompleted: function() {
			if (window.sap_webide_FacadePreview) {
				self.unSubscribeToOnlineSyncEvents();

				//Update syncStatusModel
				var syncStatusModel = self.getView().getModel("syncStatusModel");
				var d = new Date();
				syncStatusModel.getData().LastSyncTime = d.toLocaleString();

				syncStatusModel.getData().Online = true; //always online in webide

				syncStatusModel.refresh();

				//Update sync state indicator
				//SyncStateHandler.handleSyncState();
			} else {
				//sap.m.MessageToast.show("Data synchronized with server");
			}

			self.setSyncIndicators(false);

			//Update items in table
			self.getView().byId("notificationTableId").getBinding("items").refresh(true);
		},

		syncFailed: function() {
			if (window.sap_webide_FacadePreview) {
				self.unSubscribeToOnlineSyncEvents();
			} else {
				//sap.m.MessageToast.show("Synchronization with server failed");
			}

			self.setSyncIndicators(false);
		},

		/**
		 * refreshing offline store data
		 */
		refreshData: function() {
			var model = this.getView().getModel();

			if (model.hasPendingChanges() || model.newEntryContext) {
				if (devApp.isLoaded) {
					if (devApp.isOnline) {
						//Show sync busy indicator
						self.setSyncIndicators(true);

						self.flushAndRefresh();
						//this.getEventBus().publish("OfflineStore", "Refreshing");
					} else {
						//sap.m.MessageToast.show("Offline: not able to sync");
						model.refresh();
					}
				} else {
					model.refresh();
				}
			} else {
				if (devApp.isLoaded) {
					if (devApp.isOnline) {
						self.setSyncIndicators(true);

						self.flushAndRefresh();
						//this.getEventBus().publish("OfflineStore", "Refreshing");
					} else {
						//sap.m.MessageToast.show("Device is ");
						model.refresh();
					}
				} else {
					model.refresh();
				}
			}
		},

		setSyncIndicators: function(isSynching) {
			//self.getView().byId("syncButton").setEnabled(!isSynching);
			//self.getView().byId("syncIndicator").setVisible(!isSynching);
			self.getView().byId("syncBusyIndicator").setVisible(isSynching);
		},

		deviceWentOnline: function() {
			self.setSyncIndicators(true);

			self.flushAndRefresh();
		},

		deviceWentOffline: function() {
			self.setSyncIndicators(false);
		},

		flushAndRefresh: function() {
			if (devApp.isOnline) {
				//console.log("refreshing oData Model with offline store");
				//ask refreshing store after flush
				//devApp.refreshing = true;
				if (devApp.devLogon) {
					//console.log("refreshing offline store");
					devApp.devLogon.flushAppOfflineStore();
				}
			} else {
				//Update data in views
				this.getView().getModel().refresh();
			}
		},

		showSyncQuickview: function(oEvent) {
			//if (!window.sap_webide_FacadePreview) {
			this.createPopover();

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._syncQuickView.openBy(oButton);
			});
			//	}
		},

		createPopover: function() {
			if (!this._syncQuickView) {
				this._syncQuickView = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationList.controls.SyncQuickView", this);
				this.getView().addDependent(this._syncQuickView);
			}
		},

		synchronizeData: function() {
			if (this._syncQuickView) {
				this._syncQuickView.close();
			}

			if (window.sap_webide_FacadePreview || devApp.isOnline) {

				if (window.sap_webide_FacadePreview) {
					this.subscribeToOnlineSyncEvents();
				}

				this.setSyncIndicators(true);

				this.flushAndRefresh();
			} else {
				sap.m.MessageToast.show("Device is offline");
			}
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
					return "green";
			}
		},

		openErrorsView: function(oEvent) {
			if (!this._errorsView) {
				this._errorsView = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.app.fragments.ErrorsListPopover", this);
				this.getView().addDependent(this._errorsView);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._errorsView.open();
			});
		},

		closeErrorListPopupButton: function() {
			if (this._errorsView) {
				this._errorsView.close();
			}
		},

	});
});