sap.ui.define([
	"com/twobm/mobileworkorder/dev/devapp"
], function(devApp) {
	"use strict";

	return {
		handleSyncState: function() {

			if (!window.cordova || window.cordova.platformId === "browser") {
				return;
			}

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

							var error;

							data.results.forEach(
								function(item, index) {
									var parsedJSONMessage = that.getMessageTextFromError(item.Message);

									error = {
										"Message": parsedJSONMessage,
										"RequestObject": that.getRequestObjectName(item.RequestURL),
										"RequestBody": item.RequestBody,
										"RequestMethod": item.RequestMethod,
										"HTTPStatusCode": item.HTTPStatusCode,
										"RequestURL": item.RequestURL,
										"RequestID": item.RequestID,
										"ErrorUrl": data.results[index].__metadata.uri
									};

									syncStatusModel.getData().Errors.push(error);
									//syncStatusModel.refresh();

									var affectedEntitysUrl = data.results[index].__metadata.uri + "/AffectedEntity";

									var request = {
										headers: {},
										requestUri: affectedEntitysUrl,
										method: "GET"
									};

									OData.read(request,
										function(data, response) {
											syncStatusModel.getData().Errors.forEach(
												function(item, index) {

													var responseUrl = response.requestUri.replace("/AffectedEntity", "");

													if (responseUrl === item.ErrorUrl) {
														syncStatusModel.getData().Errors[index].OrderNo = data.OrderNo;

														var objectData = JSON.parse(JSON.stringify(data));
														delete objectData['@com.sap.vocabularies.Offline.v1.inErrorState'];
														delete objectData['@com.sap.vocabularies.Offline.v1.islocal'];
														delete objectData.__metadata;
														objectData.__proto__ = null;

														syncStatusModel.getData().Errors[index].ObjectData = objectData;
													}
												}
											);
											syncStatusModel.refresh();
										},
										function(e) {
											console.log("Error in read AffectedEntity");
										}
									);
								}
							);
						}

						//Check if there is data pending sync in the offline db
						devApp.devLogon.appOfflineStore.store.getRequestQueueStatus(
							function(status) {

								// if (!status.isEmpty) {
								// 	//There is data pending sync in db
								// 	syncStatusModel.getData().PendingLocalData = true;
								// } else {
								// 	syncStatusModel.getData().PendingLocalData = false;
								// }

								// that.setSyncIndicatorColor(syncStatusModel, devApp.isOnline);
								// that.setSyncStateIcon(syncStatusModel, devApp.isOnline);
								// that.setNetworkConnectionStatusText(syncStatusModel, devApp.isOnline);
								// that.setSyncStateText(syncStatusModel, devApp.isOnline);

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

									// if (!syncStatusModel.getData().InErrorState) {
									// 	//Everything is ok
									// 	syncStatusModel.getData().SyncState = self.getI18nText("syncOk");
									// }
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
				syncStatusModel.getData().SyncIcon = "sap-icon://alert";
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
			console.log("An error occurred " + JSON.stringify(e));
		},

		//Formatting methods for ErrorArchieve handling - Start

		getMessageTextFromError: function(message) {
			try {
				var parsedJSON = JSON.parse(message);

				return parsedJSON.error.message.value;

				//var errorJSON = {
				//    message: parsedJSON.error.message.value,
				//    errorCode: parsedJSON.error.code,
				//    requestId: entry.RequestID,
				//    requestBody: JSON.parse(entry.RequestBody),
				//    requestMethod: entry.RequestMethod,
				//    requestUrl: entry.RequestURL
				//};

			} catch (error) {
				return message;
			}
		},

		getRequestMethodTextFromError: function(requestMethod) {
			var title = "Error";
			if (requestMethod.toLowerCase() === "delete") {
				title = "Warning";
			}
			return title;
		},

		getRequestObjectName: function(requestUrl) {
			var orderURLPrefix = "/OrderSet";
			var timeRegistrationURLPrefix = "/TimeRegistrationSet";
			var AttachmentsURLPrefix = "/AttachmentsSet";
			var MaterialsURLPrefix = "/MaterialsSet";
			var MaterialsSummaryURLPrefix = "/MaterialsSummarySet";

			if (requestUrl.startsWith(orderURLPrefix)) {
				return "Order header";
			}

			if (requestUrl.startsWith(timeRegistrationURLPrefix)) {
				return "Time registration";
			}

			if (requestUrl.startsWith(AttachmentsURLPrefix)) {
				return "Attachment";
			}

			if (requestUrl.startsWith(MaterialsURLPrefix)) {
				return "Materials";
			}

			if (requestUrl.startsWith(MaterialsSummaryURLPrefix)) {
				return "Materials";
			}

			return "";

		}

		//Formatting methods for ErrorArchieve handling - End
	};
});