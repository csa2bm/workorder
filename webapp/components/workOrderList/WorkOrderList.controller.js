sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/Globalization",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/SyncStateHandler"
], function(Controller, devApp, Globalization, History, SyncStateHandler) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderList.WorkOrderList", {
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "workOrderList") {
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

			SyncStateHandler.handleSyncState();

			//	this.setInitialSorting();

			//flush and refresh data
			//	this.refresh();
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

		onWorkOrderItemPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			this.getRouter().navTo("workOrderDetails", {
				workOrderContext: oBindingContext.getPath().substr(1)
			});
		},

		// Pop-up for sorting and filter
		handleViewSettingsDialogButtonPressed: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderList.fragments.OrderFilterDialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		setInitialSorting: function() {
			var oTable = this.getView().byId("workOrderTableId");
			var oBinding = oTable.getBinding("items");

			var aSorters = [];

			var sortItem = "StartDate";
			var sortDescending = true;
			aSorters.push(new sap.ui.model.Sorter(sortItem, sortDescending));
			oBinding.sort(aSorters);
		},

		// Start filter and sorting based on selected.
		handleOrderFilterConfirm: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("workOrderTableId");

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

		refresh: function() {
			//Subscribe to sync events
			if (window.sap_webide_FacadePreview) {
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
			}

			self.setSyncIndicators(false);

			//Update items in table
			self.getView().byId("workOrderTableId").getBinding("items").refresh(true);
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
					} else {
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
					} else {
						model.refresh();
					}
				} else {
					model.refresh();
				}
			}
		},

		setSyncIndicators: function(isSynching) {
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			syncStatusModel.getData().IsSynching = isSynching;
			syncStatusModel.refresh();
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
				//ask refreshing store after flush
				if (devApp.devLogon) {
					//console.log("refreshing offline store");
					devApp.devLogon.flushAppOfflineStore();
				}
			} else {
				//Update data in views
				this.getView().getModel().refresh();
			}
		},

		getOrderStatusIcon: function(orderStatus) {

			if (orderStatus === this.getI18nText("orderStatusNotStarted")) {
				return "sap-icon://system-exit-2";
			} else if (orderStatus === this.getI18nText("orderStatusInProgress")) {
				return "sap-icon://system-exit-2";
			}

			return "sap-icon://system-exit-2";
		},

		getOrderStatusIconColor: function(orderStatus) {
			if (orderStatus === this.getI18nText("orderStatusNotStarted")) {
				return "#DBDBDB";
			} else if (orderStatus === this.getI18nText("orderStatusInProgress")) {
				return "#3AACF2";
			} else if (orderStatus === this.getI18nText("orderStatusCompleted")) {
				return "#30D130";
			}
		},

		orderFilterSelectPopUp: function(oEvent) {
			var oButton = oEvent.getSource();

			// create menu only once
			if (!this._orderFilterMenu) {
				this._orderFilterMenu = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderList.fragments.OrderFilterSelect", this);
				this.getView().addDependent(this._orderFilterMenu);
			}

			//var eDock = sap.ui.core.Popup.Dock;
			this._orderFilterMenu.openBy(oButton); //.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},

		isInErrorState: function(woMatObjIsInErrorState) {
			if (woMatObjIsInErrorState === true) {
				return true;

			}
			return false;
		}
	});
});