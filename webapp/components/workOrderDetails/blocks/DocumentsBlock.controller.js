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

		downloadAllFiles: function(oEvent) {
			var downloadButtonAll = oEvent.getSource();
			var documentsPath = this.getView().byId("documentsList").getBindingContext().getPath();

			if (!sap.hybrid.SMP.isOnline) {
				sap.m.MessageToast.show("No network connection: Download not possible");
				return;
			}
			
			//set buy cursor and disable documents list
			downloadButtonAll.setBusy(true);
			this.getView().byId("documentsList").setShowOverlay(false);

			var parameters = {

				success: function(oData, response) {
					var newStreamsRegistered = false;
					oData.results.some(function myFunction(item) {
						if (item['@com.sap.vocabularies.Offline.v1.mediaIsOffline']) {
							//Nothing
						} else {
							var path = "/DocumentsSet(Doctype='" + item.Doctype + "',Objky='" + item.Objky + "',Docnumber='" + item.Docnumber +
								"',Docpart='" + item.Docpart + "',Docversion='" + item.Docversion + "')";

							newStreamsRegistered = true;

							sap.hybrid.getOfflineStore().registerStreamRequest(item.Objky + item.Docnumber, path,
								function() {}.bind(this),
								function(error) {
									//Stream has probably already been registered for offline handling
								});
						}
					});

					if (newStreamsRegistered) {
						//Call store.refresh
						sap.hybrid.getOfflineStore().refresh(function(data) {
								//this.getView().byId("documentsList").setBusy(false);
								this.getView().byId("documentsList").setShowOverlay(true);
								downloadButtonAll.setBusy(false);
								sap.m.MessageToast.show("All files are Downloaded");
							}.bind(this),
							function(error) {
								downloadButtonAll.setBusy(false);
								this.getView().byId("documentsList").setShowOverlay(true);
								console.log("Failed to download stream");
							}.bind(this));
					} else {
						downloadButtonAll.setBusy(false);
						this.getView().byId("documentsList").setShowOverlay(true);
						//this.getView().byId("documentsList").setBusy(false);
						sap.m.MessageToast.show("All files are Downloaded");
					}

				}.bind(this),
				error: this.errorCallBackShowInPopUp
			};

			this.getView().getModel().read(documentsPath + "/DocumentsSet", parameters);
		},

		downloadDocument: function(oEvent) {
			var downloadButton = oEvent.getSource();
			//var documentsList = this.getView().byId("documentsList");
			var currentObject = oEvent.getSource().getBindingContext().getObject();
			var fileUrl = currentObject.__metadata.media_src;

			var fileTransfer = new FileTransfer();
			var uri = encodeURI(fileUrl);

			if (this.getView().getModel("device").getData().isHybridApp) {
				if (!sap.hybrid.SMP.isOnline) {
					sap.m.MessageToast.show("No network connection: Download not possible");
					return;
				}

				sap.hybrid.getOfflineStore().registerStreamRequest(currentObject.Objky + currentObject.Docnumber, oEvent.getSource().getBindingContext()
					.getPath(),
					function() {
						downloadButton.setBusy(true);
						sap.hybrid.getOfflineStore().refresh(function(data) {
								downloadButton.setBusy(false);
								this.getView().byId("documentsList").getBinding("items").refresh(true);
							}.bind(this),
							function(error) {
								alert("Failed to download stream");
							});
					}.bind(this),
					function(error) {
						//Stream has probably already been registered for offline handling
					});
			} else {
				// Online in browser - just open the file link and the file will be downloaded by browser
				window.open(uri);
			}
		},
		viewDocument: function(oEvent) {
			//This method is only called if the solution is running in Hybrid mode. This is controlled by view formatter
			var currentObject = oEvent.getSource().getBindingContext().getObject();

			var platformName = window.cordova.require("cordova/platform").id;
			var directoryUrl;
			if (platformName === "ios") {
				directoryUrl = cordova.file.dataDirectory + "/TempFiles/";
			} else if (platformName === "windows") {
				directoryUrl = cordova.file.dataDirectory;
			}

			//TODO?:CLEAR directoryUrl

			var fileTransfer = new FileTransfer();
			var uri = encodeURI(currentObject.__metadata.media_src);

			var fullpath = directoryUrl + encodeURI(currentObject.Filename);
			fileTransfer.download(
				uri,
				fullpath,
				function(entry) {
					if (platformName === "ios") {
						window.open(fullpath); //Attachment Viewer opens file
					} else if (platformName === "windows") {
						//08032017 - code not verified working
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
				function(error) {
					sap.m.MessageToast.show("Opening file failed");
					console.log("download error source " + error.source);
					console.log("download error target " + error.target);
					console.log("download error code" + error.code);
				},
				false, {}
			);
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

			this.getView().byId("documentsList").getBinding("items").refresh(true);

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
			var xhr = new XMLHttpRequest();
			var serviceUrl = sap.hybrid.getOfflineStore().offlineServiceRoot;
			var serviceUrlsubstring = serviceUrl.substring(0, serviceUrl.length - 1); // remove the "/" in the end of the url

			var url = serviceUrlsubstring + this.getView().getBindingContext().getPath() + "/DocumentsSet";

			xhr.open("POST", url, true);
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("content-type", file.type);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						var data = JSON.parse(xhr.responseText);
						console.log("Media created." + "Src: " + data.d.__metadata.media_src);
					} else {
						console.log("Request failed! Status: " + xhr.status);
					}
				}
			};

			xhr.send(file);
		},

		showDownloadButton: function(mediaIsOffline, isHybridApp) {
			if (isHybridApp) {
				if (mediaIsOffline) {
					return false;
				} else {
					return true;
				}
			} else {
				//If online solution always show download button
				return true;
			}
		},

		showViewButton: function(mediaIsOffline, isHybridApp) {
			if (isHybridApp) {
				if (mediaIsOffline) {
					return true;
				} else {
					return false;
				}
			} else {
				//If online solution never show view button
				return false;
			}
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