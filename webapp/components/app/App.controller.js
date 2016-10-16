sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/SyncStateHandler"
], function(Fragment, MessageBox, Controller, devapp, SyncStateHandler) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.app.App", {
		/**
		 * initializing controller, subscribe two "OfflineStore" channel event
		 */
		onInit: function() {
			var oEventBus = this.getEventBus();
			oEventBus.subscribe("OfflineStore", "Synced", this.syncFinished, this);
			oEventBus.subscribe("DeviceOnline", this.handleConnected, this);
			oEventBus.subscribe("DeviceOffline", this.handleDisconnected, this);

			oEventBus.subscribe("UpdateSyncState", SyncStateHandler.handleSyncState, this);

			//Add Content Density Style Class
			//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		/**
		 * UI5 OfflineStore channel Synced event handler, after refreshing offline store, refresh data model
		 */
		syncFinished: function() {
			this.getView().getModel().refresh();

			//Update syncStatusModel
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			var d = new Date();
			syncStatusModel.getData().LastSyncTime = d.toLocaleString();

			if (window.sap_webide_FacadePreview) {
				syncStatusModel.getData().Online = true; //always online in webide
			}
			syncStatusModel.refresh();

			//Update sync state indicator
			SyncStateHandler.handleSyncState();
		},

		handleDisconnected: function() {
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			syncStatusModel.getData().Online = false;

			SyncStateHandler.handleSyncState();
		},

		handleConnected: function() {
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			syncStatusModel.getData().Online = true;
			//syncStatusModel.refresh(true);

			SyncStateHandler.handleSyncState();
		}
	});
});