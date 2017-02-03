sap.ui.define([
	"com/twobm/mobileworkorder/components/offline/ErrorsHandler"
], function(errorsHandler) {
	"use strict";

	return {
		handleSyncState: function() {

			var that = this;

			var syncStatusModel = sap.ui.getCore().getComponent(window.componentId).getModel("syncStatusModel");

			var serviceUrl = sap.ui.getCore().getComponent(window.componentId).getModel().sServiceUrl;
			var errorsUrl = serviceUrl + "/ErrorArchive";

			var request = {
				headers: {},
				requestUri: errorsUrl,
				method: "GET"
			};

			OData.read(request,
				function(data, response) {
					syncStatusModel.getData().InErrorState = false;
					syncStatusModel.getData().Errors = [];
					syncStatusModel.getData().OrderErrors = [];
					syncStatusModel.getData().NoticationErrors = [];

					if (data.results.length > 0) {
						syncStatusModel.getData().InErrorState = true;

						errorsHandler.handleErrors(data, syncStatusModel);
					}

					//Check if there is data pending sync in the offline db
					sap.hybrid.getOfflineStore().getRequestQueueStatus(
						function(status) {

							if (!status.isEmpty) {
								//There is data pending sync in db

								//Do not overwrite error state if that is present
								//Error state is most important
								if (!syncStatusModel.getData().InErrorState) {
									//Data created offline is awaiting sync with server
									//syncStatusModel.getData().SyncState = self.getI18nText("syncDataPending");
								}
								syncStatusModel.getData().PendingLocalData = true;
							} else {
								syncStatusModel.getData().PendingLocalData = false;
							}

							that.setSyncIndicatorColor(syncStatusModel, sap.hybrid.SMP.isOnline);
							that.setSyncStateIcon(syncStatusModel, sap.hybrid.SMP.isOnline);
							that.setNetworkConnectionStatusText(syncStatusModel, sap.hybrid.SMP.isOnline);
							that.setSyncStateText(syncStatusModel, sap.hybrid.SMP.isOnline);

							syncStatusModel.refresh(true);
						},
						function(e) {
							syncStatusModel.refresh(true);
						}
					);

					syncStatusModel.refresh(true);
				}, this.errorCallBack);

		},

		setSyncIndicatorColor: function(syncStatusModel, isOnline) {
			if (syncStatusModel.getData().InErrorState) {
				syncStatusModel.getData().SyncColor = "#CC1919"; //Same color as Reject type button
			} else if (syncStatusModel.getData().PendingLocalData) {
				syncStatusModel.getData().SyncColor = "orange";
			} else if (isOnline) {
				syncStatusModel.getData().SyncColor = "green";
			} else {
				syncStatusModel.getData().SyncColor = "grey";
			}
		},

		setSyncStateIcon: function(syncStatusModel, isOnline) {
			if (syncStatusModel.getData().InErrorState) {
				syncStatusModel.getData().SyncIcon = "sap-icon://error";
			} else if (syncStatusModel.getData().PendingLocalData) {
				syncStatusModel.getData().SyncIcon = "sap-icon://system-exit-2";
			} else {
				syncStatusModel.getData().SyncIcon = "sap-icon://overlay";
			}
		},

		setNetworkConnectionStatusText: function(syncStatusModel, isOnline) {
			if (isOnline) {
				syncStatusModel.getData().NetworkConnectionText = "Online";
			} else {
				syncStatusModel.getData().NetworkConnectionText = "Offline";
			}
		},

		setSyncStateText: function(syncStatusModel, isOnline) {
			if (syncStatusModel.getData().InErrorState) {
				syncStatusModel.getData().SyncStateText = "Errors from SAP";
			} else if (syncStatusModel.getData().PendingLocalData) {
				syncStatusModel.getData().SyncStateText = "Pending Changes";
			} else if (isOnline) {
				syncStatusModel.getData().SyncStateText = "OK";
			} else {
				syncStatusModel.getData().SyncStateText = "Offline";
			}
		},

		errorCallback: function(e) {
			sap.m.MessageToast.show("SyncStateHandler: An error occurred " + JSON.stringify(e));
		}
	};
});