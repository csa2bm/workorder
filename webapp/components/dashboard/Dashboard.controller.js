sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller, History, Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.dashboard.Dashboard", {
		formatter:Formatter,
		
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "Dashboard") {
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

			//flush and refresh data
			this.refresh();
		},

		onPressOtherWorkorders: function() {
		
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				//var oRouter = this.getRouter();
				oRouter.navTo("workOrderList", true);
			
			}
		},

		// Pop-up for sorting and filter
		handleViewSettingsDialogButtonPressed: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderList.controls.OrderFilterDialog", this);
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
				this._syncQuickView = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderList.controls.SyncQuickView", this);
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

		getSyncStateText: function(online, pendingdata) {
			if (pendingdata) {
				return "Pending Changes";
			}

			if (online) {
				return "OK";
			} else {
				return "Offline";
			}
		},

		getSyncStateIcon: function(online, pendingdata) {
			if (pendingdata) {
				return "sap-icon://system-exit-2";
			}

			if (online) {
				return "sap-icon://overlay";
			} else {
				return "sap-icon://overlay";
			}
		},

		getSyncStatusIconColor: function(online, pendingdata) {
			if (pendingdata) {
				return "orange";
			}
			if (online) {
				return "green";
			} else {
				return "grey";
			}
		},

		// getNetworkConnectionStatusColor: function(connection) {
		// 	if (connection) {
		// 		return "green";
		// 	} else {
		// 		return "grey";
		// 	}
		// },

		// getNetworkConnectionStatusIcon: function(connection) {
		// 	if (connection) {
		// 		return "sap-icon://connected";
		// 	} else {
		// 		return "sap-icon://disconnected";
		// 	}
		// },

		getNetworkConnectionStatusText: function(connection) {
			if (connection) {
				return "Online";
			} else {
				return "Offline";
			}
		}
	});
});