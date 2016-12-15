sap.ui.define([
	"sap/m/MessageBox",
	"com/twobm/mobileworkorder/util/SyncStateHandler"
], function(MessageBox, SyncStateHandler) {
	"use strict";
	return {
		needsSync: false,

		start: function() {
			document.addEventListener("online", this.handleConnected.bind(this), false);
			document.addEventListener("offline", this.handleDisconnected.bind(this), false);

			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("ShowErrorList", this.openErrorsView, this);

			/*sap.ui.getCore().getComponent("__component0").getModel().attachBatchRequestCompleted(function(event) {
				//this.refreshSyncStatus();
				if (event.getParameters().method === "POST") {

				}
			}.bind(this));

			sap.ui.getCore().getComponent("__component0").getModel().attachRequestCompleted(function(event) {
				//this.refreshSyncStatus();
				if (event.getParameters().method === "POST") {
					if (event.getParameters().response.statusCode === "201") {
						this.needsSync = true;
					}
				}
			}.bind(this));*/

		},

		syncIfNeeded: function() {
			sap.hybrid.getOfflineStore().getRequestQueueStatus(
				function(status) {
					if (!status.isEmpty) {
						this.sync();
					}
				}.bind(this));
		},

		sync: function() {
			this.setSyncIndicators(true);
			if (sap.hybrid.SMP.isOnline) {
				sap.hybrid.synAppOfflineStore(function() {
						sap.ui.getCore().getComponent("__component0").getModel().refresh();

						//Update syncStatusModel
						var syncStatusModel = sap.ui.getCore().getComponent("__component0").getModel("syncStatusModel");
						var d = new Date();
						syncStatusModel.getData().LastSyncTime = d.toLocaleString();

						syncStatusModel.refresh();

						this.setSyncIndicators(false);

						//Update sync state indicator
						SyncStateHandler.handleSyncState();
					}.bind(this),
					function() {
						// Error during sync - most likely device is offline
						alert("error during sync");
						alert(sap.hybrid.SMP.isOnline);
						this.setSyncIndicators(true);
					}.bind(this),
					false);
			}
		},

		showMessage: function(message) {
			sap.m.MessageBox.show(message, {
				icon: sap.m.MessageBox.Icon.None,
				title: "Message",
				actions: [sap.m.MessageBox.Action.OK],
				defaultAction: sap.m.MessageBox.Action.NO,
				onClose: function(oAction, object) {

				}
			});
		},

		//---- Morten stuff

		handleDisconnected: function() {
			var syncStatusModel = sap.ui.getCore().getComponent("__component0").getModel("syncStatusModel");
			syncStatusModel.getData().Online = false;

			SyncStateHandler.handleSyncState();
		},

		handleConnected: function() {
			var syncStatusModel = sap.ui.getCore().getComponent("__component0").getModel("syncStatusModel");
			syncStatusModel.getData().Online = true;

			this.sync();

			SyncStateHandler.handleSyncState();
		},

		setSyncIndicators: function(isSynching) {
			var syncStatusModel = sap.ui.getCore().getComponent("__component0").getModel("syncStatusModel");
			syncStatusModel.getData().IsSynching = isSynching;
			syncStatusModel.refresh();
		}
	};
});