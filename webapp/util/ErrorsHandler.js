sap.ui.define([
	"com/twobm/mobileworkorder/dev/devapp"
], function(devApp) {
	"use strict";

	return {
		
		undefinedObjectName: "Unhandled object",
		orderMetaObjectName: "Order",
		notificationMetaObjectName: "Notification",
		
		handleErrors : function(data, syncStatusModel){
			var error;
			var errorMap = {};
			
			self = this;

			data.results.forEach(
				function(item, index) {
					var parsedJSONMessage = this.getMessageTextFromError(item.Message);

					error = {
						"Message": parsedJSONMessage,
						"RequestMetaObject": this.getRequestMetaObjectName(item.RequestURL),
						"RequestObject": this.getRequestObjectName(item.RequestURL),
						"RequestBody": item.RequestBody,
						"RequestMethod": item.RequestMethod,
						"HTTPStatusCode": item.HTTPStatusCode,
						"RequestURL": item.RequestURL,
						"RequestID": item.RequestID,
						"ErrorUrl": data.results[index].__metadata.uri,
						"ObjectID" : "" //assigned later from AffectedEntity
					};
					
					syncStatusModel.getData().Errors.push(error);
					
					//Check affectedEntity for further information
					var affectedEntitysUrl = data.results[index].__metadata.uri + "/AffectedEntity";

					var request = {
						headers: {},
						requestUri: affectedEntitysUrl,
						method: "GET"
					};

					OData.read(request,
						function(data, response) {
							syncStatusModel.getData().Errors.forEach(
								function(item, indexNotUsed) {

									var responseUrl = response.requestUri.replace("/AffectedEntity", "");
									var objectId;
									
									if (responseUrl === item.ErrorUrl) {
										if(syncStatusModel.getData().Errors[index].RequestObject === self.orderMetaObjectName){
											objectId = data.Orderid;
											
											syncStatusModel.getData().Errors[index].ObjectID = objectId;
											//Assign to array
											syncStatusModel.getData().OrderErrors.push(objectId);
											
										}
										else if(syncStatusModel.getData().Errors[index].RequestObject === self.notificationMetaObjectName){
											objectId = data.NotifNo;
											
											syncStatusModel.getData().Errors[index].ObjectID = objectId;
											//Assign to array
											syncStatusModel.getData().NoticationErrors.push(objectId);
										}
										else{
											//We do not know the failing object therefore we cannot get the details
										}
										
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
		},
		
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
		},
		
		getRequestMetaObjectName: function(requestUrl) {
			var orderURLPrefix = "/OrderSet";
			var notificationSetURLPrefix = "/NotificationSet";

			if (requestUrl.startsWith(orderURLPrefix)) {
				return self.orderMetaObjectName;
			}

			if (requestUrl.startsWith(notificationSetURLPrefix)) {
				return self.notificationMetaObjectName;
			}

			return self.undefinedObjectName;
		}
	};
});