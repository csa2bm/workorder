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
						sap.m.MessageToast.show("File downloaded: " + entry.toURL());
						console.log("download complete: " + entry.toURL());
					},
					function(error) {
						sap.m.MessageToast.show("File download failed");
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
			var isHybridApp = this.getView().getModel("device").getData().isHybridApp;
			var contentType = oEvent.getParameters().files[0].type;

			if (isHybridApp) {
				var file = oEvent.getParameters().files[0];
				this.sendUploadRequestOffline(file);
			} else {
				this.sendUploadRequest(contentType);
			}

		},
		//Before upload started
		onUploadStarted: function(oControlEvent) {
			sap.ui.core.BusyIndicator.show();
		},

		onUploadComplete: function(oControlEvent) {
			sap.ui.core.BusyIndicator.hide();
			var oFileUploader = this.getView().byId("customFileUploader");
			oFileUploader.destroyHeaderParameters();

			this.getView().byId("attachmentsList").getBinding("items").refresh(true);

		},

		sendUploadRequest: function(contentType) {
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
				value: contentType
			}));

			oFileUploader.setSendXHR(true);
			oFileUploader.setUploadUrl(serviceUrl);
			oFileUploader.upload();
		},

		sendUploadRequestOffline: function(file) {
            var that = this;
			var xhr = new XMLHttpRequest();
			var serviceUrl = sap.hybrid.getOfflineStore().serviceRoot;
			var serviceUrlsubstring = serviceUrl.substring(0,serviceUrl.length-1); // remove the "/" in the end of the url
			
            var url = serviceUrlsubstring + this.getView().getBindingContext().getPath() + "/DocumentsSet";
                             
            /*this.getView().getModel().refreshSecurityToken(function(response, odata){
                                                                            console.log("token received");
                                                                            var token = that.getView().getModel().getSecurityToken();
                                                                            console.log(token);
                                                                            }, function(){
                                                                            console.log("token not received. Error");
                                                                            }, false);
                             
             */
          
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("x-csrf-token", this.getView().getModel().getSecurityToken());
            //xhr.setRequestHeader("prevent_xsrf", false);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						var data = JSON.parse(xhr.responseText);
						console.log("Media created." + "Src: " + data.d.__metadata.media_src);
					} else {
						console.log("Request failed! Status: " + xhr.status);
					}
				}
			}

			xhr.send(file);

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