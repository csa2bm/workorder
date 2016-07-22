sap.ui.define([
	"com/twobm/mobileworkorder/dev/devapp"
], function(devApp) {
	"use strict";

	return {
		handleSyncState: function() {
			if (window.sap_webide_FacadePreview) {
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
						var syncStatusModel = sap.ui.getCore().getComponent("__component0").getModel("syncStatusModel");

						var inErrorState = false;

						syncStatusModel.getData().Errors = [];

						if (data.results.length > 0) {
							inErrorState = true;

							//var errorMessage = JSON.parse(data.results[0].Message);

							//Errors has occured in sync with server
							syncStatusModel.getData().SyncState = self.getI18nText("syncError");

							data.results.forEach(function(entry) {

								var message;
								//var errorCode = "";
								try {
									var parsedJSON = JSON.parse(entry.Message);

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

									//Do not overwrite error state if that is present
									//Error state is most important
									if (!inErrorState) {
										//Data created offline is awaiting sync with server
										syncStatusModel.getData().SyncState = self.getI18nText("syncDataPending");
									}
									syncStatusModel.getData().PendingLocalData = true;
								} else {
									syncStatusModel.getData().PendingLocalData = false;

									if (!inErrorState) {
										//Everything is ok
										syncStatusModel.getData().SyncState = self.getI18nText("syncOk");
									}
								}
							},
							function(e) {
								//var x = 0;
							}
						);

						syncStatusModel.refresh();
					}, this.errorCallBack);
			}
		},

		errorCallback: function(e) {
			//alert("An error occurred " + JSON.stringify(e));
			console.log("An error occurred " + JSON.stringify(e));
		}
	};
});