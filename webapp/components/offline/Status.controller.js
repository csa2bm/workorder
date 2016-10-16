sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/SyncStateHandler"
], function(Controller, DevApp, SyncStateHandler) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.offline.Status", {

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
				if (DevApp.isLoaded) {
					if (DevApp.isOnline) {
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
				if (DevApp.isLoaded) {
					if (DevApp.isOnline) {
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
			if (DevApp.isOnline) {
				//ask refreshing store after flush
				if (DevApp.devLogon) {
					//console.log("refreshing offline store");
					DevApp.devLogon.flushAppOfflineStore();
				}
			} else {
				//Update data in views
				this.getView().getModel().refresh();
			}
		},

		showSyncQuickview: function(oEvent) {
			this.createPopover();

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._syncQuickView.openBy(oButton);
			});
		},

		createPopover: function() {
			if (!this._syncQuickView) {
				this._syncQuickView = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.offline.fragments.SyncQuickView", this);
				this.getView().addDependent(this._syncQuickView);
			}
		},

		synchronizeData: function() {
			if (this._syncQuickView) {
				this._syncQuickView.close();
			}

			if (window.sap_webide_FacadePreview || DevApp.isOnline) {

				if (window.sap_webide_FacadePreview) {
					this.subscribeToOnlineSyncEvents();
				}

				this.setSyncIndicators(true);

				this.flushAndRefresh();
			} else {
				sap.m.MessageToast.show("Device is offline");
			}
		},

		resetStore: function() {
			var that = this;

			this._syncQuickView.close();

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			sap.m.MessageBox.show("Are you sure that you want to reset the offline database and login again?", {
				icon: sap.m.MessageBox.Icon.None,
				title: "Reset database",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						that.closeSyncPopup();
						sap.ui.getCore().byId("appShell").setVisible(false); // hide app with data
						sap.m.MessageToast.show("Resetting data and logging out");
						DevApp.devLogon.reset();
					}
				}
			});
		},

		closeSyncPopup: function() {
			if (this._syncQuickView) {
				this._syncQuickView.close();
			}
		}
	});
});