sap.ui.define([
	"sap/m/MessageBox",
	"com/twobm/mobileworkorder/components/offline/SyncStateHandler"
], function(MessageBox, SyncStateHandler) {
	"use strict";
	return {
		needsSync: false,
        isSyncing: false,
        extraSyncNeeded: false,
        
		start: function(router) {
			// Attach online / offline events
			document.addEventListener("online", this.onConnected.bind(this), false);
			document.addEventListener("offline", this.onDisconnected.bind(this), false);
			// Attach to router so we can start sync when certain pages are shown
			router.attachRoutePatternMatched(this.onRouteMatched, this);

			sap.Push.registerForNotificationTypes(sap.Push.notificationType.badge | sap.Push.notificationType.sound | sap.Push.notificationType
				.alert,
				function(message) {

				}.bind(this),
				function(message) {
					var pushregisterFailedText = sap.ui.getCore().getComponent(window.componentId).getModel("i18n").getResourceBundle().getText("SyncManager-PushRegisterFailed");
					this.showMessage(pushregisterFailedText + ": " + message);
				}.bind(this),
				function(message) {
					this.sync();
				}.bind(this), "");
		},

		saveLastSyncTimeInBrowserCache: function(lastSyncTime) {
			jQuery.sap.require("jquery.sap.storage");

			if (jQuery.sap.storage.isSupported()) {
				//Get Storage object to use
				var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

				// Set value in htlm5 storage 
				oStorage.put("LastSyncTime", lastSyncTime);
			}
		},

		onRouteMatched: function(oEvent) {
			// Get name of route
			var sName = oEvent.getParameter("name");

			// Are we navigating to a page that should trigger sync?
			if (sName === "dashboard" || sName === "workOrderList" || sName === "notificationList") {
				// Sync
				this.syncIfNeeded();
				// Update state that drives the sync UI
				SyncStateHandler.handleSyncState();
			}
		},

		syncIfNeeded: function() {
			// Are there any pending changes?
			sap.hybrid.getOfflineStore().getRequestQueueStatus(
				function(status) {
					if (!status.isEmpty) {
						// Then sync
						this.sync();
					}
				}.bind(this));
		},

		sync: function() {
			// Only sync when there is a connection
			if (sap.hybrid.SMP.isOnline) {
                
                if (this.isSyncing)
                {
                    this.extraSyncNeeded = true;
                    return;
                }
                
                this.isSyncing = true;
                
				// Show sync indicator
				this.setSyncIndicators(true);
				// Start sync
				sap.hybrid.synAppOfflineStore(function() {
						// Refresh default model to display any changes to data
						sap.ui.getCore().getComponent(window.componentId).getModel().refresh();
						
						var eventBus = sap.ui.getCore().getEventBus();
						eventBus.publish("OfflineStore", "Updated");

						// Set new date / time for last sync
						var syncStatusModel = sap.ui.getCore().getComponent(window.componentId).getModel("syncStatusModel");
						var d = new Date();
						syncStatusModel.getData().LastSyncTime = d.toLocaleString();
						syncStatusModel.refresh();

						this.saveLastSyncTimeInBrowserCache(syncStatusModel.getData().LastSyncTime);

                        this.isSyncing = false;
                    
                        if (this.extraSyncNeeded)
                        {
                            this.extraSyncNeeded = false;
                            this.syncIfNeeded();
                        }
                    
						// Hide sync indicator
						this.setSyncIndicators(false);

						//Update sync state 
						SyncStateHandler.handleSyncState();
					}.bind(this),
					function(error) {
						// Error during sync - most likely the device went offline during a sync
						if (sap.hybrid.SMP.isOnline) {
							var text = sap.ui.getCore().getComponent(window.componentId).getModel("i18n").getResourceBundle().getText("SyncManager-SyncError"); 
							// If this was not due to the device beeing offline, show the error
							this.showMessage(text + ": " + error);
						}

                        this.isSyncing = false;
                    
						// Hide sync indicator
						this.setSyncIndicators(false);
					}.bind(this),
					false);
			}
		},

		showMessage: function(message) {
			var title = sap.ui.getCore().getComponent(window.componentId).getModel("i18n").getResourceBundle().getText("SyncManager-MessageTitle");
			
			sap.m.MessageBox.show(message, {
				icon: sap.m.MessageBox.Icon.None,
				title: title,
				actions: [sap.m.MessageBox.Action.OK],
				defaultAction: sap.m.MessageBox.Action.NO,
				onClose: function(oAction, object) {}
			});
		},

		onDisconnected: function() {
			// Set connection status on sync model
			var syncStatusModel = sap.ui.getCore().getComponent(window.componentId).getModel("syncStatusModel");
			syncStatusModel.getData().Online = false;
			// Update sync state
			SyncStateHandler.handleSyncState();
		},

		onConnected: function() {
			// Set connection status on sync model
			var syncStatusModel = sap.ui.getCore().getComponent(window.componentId).getModel("syncStatusModel");
			syncStatusModel.getData().Online = true;
			// Synchronize
			this.sync();
			// Update sync state
			SyncStateHandler.handleSyncState();
		},

		setSyncIndicators: function(isSynching) {
			var syncStatusModel = sap.ui.getCore().getComponent(window.componentId).getModel("syncStatusModel");
			syncStatusModel.getData().IsSynching = isSynching;
			syncStatusModel.refresh();
		}
	};
});