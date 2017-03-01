sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.blocks.DocumentsBlock", {

		onInit: function() {},

		formatDateTimeShort: function(oValue) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});

			if (oValue) {
				// timezoneOffset is in hours convert to milliseconds  
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				return dateFormat.format(new Date(oValue.getTime() + TZOffsetMs)); //05-12-2012  
			} else {
				return "";
			}
		},

		downloadDocument: function(oEvent) {
			var currentObject = oEvent.getSource().getBindingContext().getObject();
			var fileUrl = currentObject.__metadata.media_src;

			var fileTransfer = new FileTransfer();
			var uri = encodeURI(fileUrl);

			var isHybridApp = this.getView().getModel("device").getData().isHybridApp;
			var directoryUrl;

			if (isHybridApp) {

				var platformName = window.cordova.require("cordova/platform").id;
				if (platformName === "ios") {
					directoryUrl = cordova.file.documentsDirectory;
				} else if (platformName === "windows") {
					directoryUrl = cordova.file.dataDirectory;
				}
				var fullpath = directoryUrl + encodeURI(currentObject.Filename);
				fileTransfer.download(
					uri,
					fullpath,
					function(entry) {
						console.log("download complete: " + entry.toURL());
					},
					function(error) {
						console.log("download error source " + error.source);
						console.log("download error target " + error.target);
						console.log("download error code" + error.code);
					},
					false, {}
				);
			} else {
				window.open(uri);
			}
		},
		viewDocument: function(oEvent) {
			var currentObject = oEvent.getSource().getBindingContext().getObject();

			var platformName = window.cordova.require("cordova/platform").id;
			if (platformName === "ios") {
				var directoryUrl = cordova.file.documentsDirectory;
				window.open(directoryUrl + encodeURI(currentObject.Filename));
			} else if (platformName === "windows") {
				var applicationData = Windows.Storage.ApplicationData.current;
				var localFolder = applicationData.localFolder;
				//grab the file and return a promise
				localFolder.getFileAsync(encodeURI(currentObject.Filename))
					.then(function(file) {
						//launch the file
						Windows.System.Launcher.launchFileAsync(file);
					});

			}
		},
		onFileSelected: function(oEvent) {

			var oFileUploader = this.getView().byId("customFileUploader");

			var serviceUrl = this.getView().getModel().sServiceUrl + this.getView().getBindingContext().getPath() + "/DocumentsSet";

			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: this.getView().getModel().getSecurityToken()
			}));

			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: oFileUploader.getValue()
			}));
			
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "content-type",
				value: oEvent.getParameters().files[0].type
			}));
			oFileUploader.setSendXHR(true);
			oFileUploader.setUploadUrl(serviceUrl);
			oFileUploader.upload();
			oFileUploader.destroyHeaderParameters();
		}

		/*
		doFileExist: function(fileName){
			var isHybridApp = this.getView().getModel("device").getData().isHybridApp;
			
			var platformName = window.cordova.require("cordova/platform").id;
			
			if(isHybridApp){
				if(platformName === "ios"){
					storagePath = cordova.file.documentsDirectory + fileName;
					
					var successCallback = function(data){
						
					}
					
					window.resolveLocalFileSystemURL(storagePath, successCallback, downloadAsset);
				}
				
				
				
			}
			
		}
		*/

	});
});