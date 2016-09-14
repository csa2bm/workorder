sap.ui.define([
	"com/twobm/mobileworkorder/dev/devapp"
], function(devApp) {
	"use strict";

	return {
		handleSyncState: function() {

			var that = this;

			var syncStatusModel = sap.ui.getCore().getComponent("__component0").getModel("syncStatusModel");

			if (window.sap_webide_FacadePreview) {
				syncStatusModel.getData().SyncColor = "green"; //Always online
				syncStatusModel.refresh(true);

				//Not sync when online in webide
				return;
			}

			if (devApp.devLogon.isOfflineStoreOpen) {
				var serviceUrl = sap.ui.getCore().getComponent("__component0").getModel().sServiceUrl;
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

						if (data.results.length > 0) {

							syncStatusModel.getData().InErrorState = true;

							//var errorMessage = JSON.parse(data.results[0].Message);

							data.results.forEach(function(entry) {

								var message;
								//var errorCode = "";
								try {
									console.log(entry);
									console.log(entry.Message);
									var parsedJSON = JSON.parse(entry.Message);

									// sap.m.MessageBox.show(parsedJSON, {
									// 	icon: sap.m.MessageBox.Icon.INFORMATION,
									// 	title: "!",
									// 	actions: [sap.m.MessageBox.Action.OK]
									// });

									var errorJSON = {
										message: parsedJSON.error.message.value,
										errorCode: parsedJSON.error.code,
										requestId: entry.RequestID,
										requestBody: JSON.parse(entry.RequestBody),
										requestMethod: entry.RequestMethod,
										requestUrl: entry.RequestURL
									};

									syncStatusModel.getData().Errors.push(errorJSON);

								} catch (e) {
									message = entry.Message;

									sap.m.MessageBox.show(message, {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error from SAP",
										actions: [sap.m.MessageBox.Action.OK]
									});
								}
							});
						}

						//Check if there is data pending sync in the offline db
						devApp.devLogon.appOfflineStore.store.getRequestQueueStatus(
							function(status) {
								if (!status.isEmpty) {
									//There is data pending sync in db
									syncStatusModel.getData().PendingLocalData = true;
								} else {
									syncStatusModel.getData().PendingLocalData = false;
								}

								that.setSyncIndicatorColor(syncStatusModel, devApp.isOnline);
								that.setSyncStateIcon(syncStatusModel, devApp.isOnline);
								that.setNetworkConnectionStatusText(syncStatusModel, devApp.isOnline);
								that.setSyncStateText(syncStatusModel, devApp.isOnline);

								syncStatusModel.refresh(true);
							},
							function(e) {
								//var x = 0;
								syncStatusModel.refresh(true);
							}
						);

						syncStatusModel.refresh(true);
					}, this.errorCallBack);
			}
		},

		setSyncIndicatorColor: function(syncStatusModel, isOnline) {
			if (syncStatusModel.getData().InErrorState) {
				syncStatusModel.getData().SyncColor = "red";
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
				syncStatusModel.getData().SyncIcon = "sap-icon://overlay";
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
			//alert("An error occurred " + JSON.stringify(e));
			console.log("An error occurred " + JSON.stringify(e));
		}
	};
});