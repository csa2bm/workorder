sap.ui.define([

], function() {
	"use strict";

	return {

		undefinedObjectName: "Unhandled object",
		orderMetaObjectName: "Order",
		notificationMetaObjectName: "Notification",

		handleErrors: function(data, syncStatusModel) {
			var error;
			//var errorMap = {};

			self = this;

			data.results.forEach(
				function(item, index) {
					var parsedJSONMessage = self.getMessageTextFromError(item.Message);

					error = {
						"Message": parsedJSONMessage,
						"RequestMetaObject": self.getRequestMetaObjectName(item.RequestURL), // The Overlying object for instance Order
						"RequestObject": self.getRequestObjectName(item.RequestURL), // The changed object in request for instance Time Registration
						"ObjectID": "", //For instance orderid  //assigned later from AffectedEntity
						"RequestBody": item.RequestBody,
						"RequestMethod": item.RequestMethod,
						"HTTPStatusCode": item.HTTPStatusCode,
						"RequestURL": item.RequestURL,
						"RequestID": item.RequestID,
						"ErrorUrl": data.results[index].__metadata.uri
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
						function(data1, response) {
							syncStatusModel.getData().Errors.forEach(
								function(item1, indexNotUsed) {

									var responseUrl = response.requestUri.replace("/AffectedEntity", "");
									var objectId;

									if (responseUrl === item1.ErrorUrl) {

										if (syncStatusModel.getData().Errors[index].RequestMetaObject === self.orderMetaObjectName) {
											//Error related to an Order
											
											objectId = data1.Orderid;

											syncStatusModel.getData().Errors[index].ObjectID = objectId;
											//Assign to array

											syncStatusModel.getData().OrderErrors.push(objectId);
										} else if (syncStatusModel.getData().Errors[index].RequestMetaObject === self.notificationMetaObjectName) {
											//Error related to an Notification
											
											objectId = data1.NotifNo;

											syncStatusModel.getData().Errors[index].ObjectID = objectId;
											//Assign to array
											syncStatusModel.getData().NoticationErrors.push(objectId);
										} else {
											//We do not know the failing object therefore we cannot get the details
										}

										var objectData = JSON.parse(JSON.stringify(data1));
										delete objectData['@com.sap.vocabularies.Offline.v1.inErrorState'];
										delete objectData['@com.sap.vocabularies.Offline.v1.islocal'];
										delete objectData.__metadata;
										//objectData.__proto__ = null;

										syncStatusModel.getData().Errors[index].ObjectData = objectData;
									}

									syncStatusModel.refresh(true);
								}
							);
							syncStatusModel.refresh();
						},
						function(e) {
							//console.log("Error in read AffectedEntity");
						}
					);
				}
			);
		},

		getMessageTextFromError: function(message) {
			try {
				var parsedJSON = JSON.parse(message);

				return parsedJSON.error.message.value;

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

		// Method only used to insert display string in error popup view
		getRequestObjectName: function(requestUrl) {
			var orderURLPrefix = "/OrderSet";
			var timeRegistrationURLPrefix = "/TimeRegistrationSet";
			var AttachmentsURLPrefix = "/AttachmentsSet";
			var MaterialsURLPrefix = "/MaterialsSet";
			var MaterialsSummaryURLPrefix = "/MaterialsSummarySet";
			
			//OrderSet(Orderid='4000095')/OrderGoodsMovements
			// OrderSet(Orderid='4000095')/OrderTimeRegistration
			//OrderSet(Orderid='" + orderNo + "')/OrderAttachments

			if (requestUrl.startsWith(orderURLPrefix)) {
				return "Order";
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

		/*	Function used to determine the overlying changed object.
			This is used to related the odata post error to the correct overlying object
		*/
		getRequestMetaObjectName: function(requestUrl) {
			var orderRelatedURLPrefixes = ["/OrderSet", "/OperationsSet", "/MeasurementDocsSet", "/AttachmentsSet"];
			var notificationRelatedURLPrefixes = ["/NotificationSet", "NotifAttachmentsSet"];

			if ($.inArray(requestUrl, orderRelatedURLPrefixes) >= 0) {
				return self.orderMetaObjectName;
			}

			if ($.inArray(requestUrl, notificationRelatedURLPrefixes) >= 0) {
				return self.notificationMetaObjectName;
			}

			return self.undefinedObjectName;
		}
	};
});