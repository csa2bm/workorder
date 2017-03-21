sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.blocks.DocumentsBlock", {

		downloadAllFiles: function(oEvent) {
			var downloadButtonAll = oEvent.getSource();
			var documentsPath = this.getView().byId("documentsList").getBindingContext().getPath();

			if (!sap.hybrid.SMP.isOnline) {
				sap.m.MessageToast.show(this.getI18nText("WorkOrderDetails-DocumentsBlock-DownloadNotPossible"));
				return;
			}

			//set buy cursor and disable documents list
			downloadButtonAll.setBusy(true);
			this.getView().byId("documentsList").setShowOverlay(true);

			var parameters = {

				success: function(oData, response) {
					var newStreamsRegistered = false;
					oData.results.some(function myFunction(item) {
						if (item['@com.sap.vocabularies.Offline.v1.mediaIsOffline'] || item.Isurl) {
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
								this.getView().byId("documentsList").setShowOverlay(false);
								this.getView().byId("documentsList").getBinding("items").refresh(true);
								downloadButtonAll.setBusy(false);
								sap.m.MessageToast.show(this.getI18nText("WorkOrderDetails-DocumentsBlock-AllFilesDownloaded"));
							}.bind(this),
							function(error) {
								downloadButtonAll.setBusy(false);
								this.getView().byId("documentsList").getBinding("items").refresh(true);
								this.getView().byId("documentsList").setShowOverlay(false);
								console.log("Failed to download stream");
							}.bind(this));
					} else {
						downloadButtonAll.setBusy(false);
						this.getView().byId("documentsList").setShowOverlay(false);
						sap.m.MessageToast.show(this.getI18nText("WorkOrderDetails-DocumentsBlock-AllFilesDownloaded"));
					}

				}.bind(this),
				error: function(error) {
					this.errorCallBackShowInPopUp(error);
				}.bind(this)
			};

			this.getView().getModel().read(documentsPath + "/DocumentsSet", parameters);
		},

		downloadDocument: function(oEvent) {
			var downloadButton = oEvent.getSource();
			var currentObject = oEvent.getSource().getBindingContext().getObject();
			var fileUrl = currentObject.__metadata.media_src;

			var fileTransfer = new FileTransfer();
			var uri = encodeURI(fileUrl);

			if (this.getView().getModel("device").getData().isHybridApp) {
				if (!sap.hybrid.SMP.isOnline) {
					sap.m.MessageToast.show(this.getI18nText("WorkOrderDetails-DocumentsBlock-DownloadNotPossible"));
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
							}.bind(this), ["DocumentsSet"]);
					}.bind(this),
					function(error) {
						//Stream has probably already been registered for offline handling
						this.getView().byId("documentsList").getBinding("items").refresh(true);
					}.bind(this));
			} else {
				// Online in browser - just open the file link and the file will be downloaded by browser
				window.open(uri);
			}
		},
		viewDocument: function(oEvent) {
			//This method is only called if the solution is running in Hybrid mode. This is controlled by view formatter
			var currentObject = oEvent.getSource().getBindingContext().getObject();

			//If currentObject is only a URL link just open in window.open
			if (currentObject.Isurl) {
				window.open(currentObject.Filename);
				return;
			}

			var platformName = window.cordova.require("cordova/platform").id;
			var directoryUrl;
			if (platformName === "ios") {
				directoryUrl = cordova.file.dataDirectory; // + "TempFiles/";
			} else if (platformName === "windows") {
				directoryUrl = cordova.file.dataDirectory;
			}

			//TODO?:CLEAR directoryUrl

			var fileTransfer = new FileTransfer();
			var uri = encodeURI(currentObject.__metadata.media_src);

			var fullpath = directoryUrl + encodeURI(currentObject.Filename);
			fullpath = fullpath.replace(new RegExp("%20", 'g'), ""); //Replace spaces or else the file cannot open locally
			fileTransfer.download(
				uri,
				fullpath,
				function(entry) {
					if (platformName === "ios") {
						var re = /(?:\.([^.]+))?$/;
						var fileExtension = re.exec(fullpath)[1];

						if (fileExtension && fileExtension.toLowerCase() === "mov") {
							//if .mov file open with inAppBrowser
							cordova.InAppBrowser.open(fullpath, '_blank');
						} else {
							window.open(fullpath); //Attachment Viewer opens file
						}
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
					sap.m.MessageToast.show(this.getI18nText("WorkOrderDetails-DocumentsBlock-OpenDocumentFailed"));
					console.log("download error source " + error.source);
					console.log("download error target " + error.target);
					console.log("download error code" + error.code);
				}.bind(this),
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

			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "Accept",
				value: "application/json"
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

			var userFullName = this.getView().getModel("appInfoModel").getData().UserFullName;
			var userName = this.getView().getModel("appInfoModel").getData().UserName;

			var fileName = file.name;

			if (window.cordova.require("cordova/platform").id === "ios") {
				var re = /(?:\.([^.]+))?$/;
				var fileExtension = re.exec(fileName)[1];

				if (fileExtension && fileExtension.toLowerCase() === "mov") {
					var date = new Date();
					var month = ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1);
					var day = (date.getDate() < 10 ? "0" : "") + date.getDate();
					var hour = (date.getHours() < 10 ? "0" : "") + date.getHours();
					var min = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
					var sec = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
					var dateStr = day + month + date.getFullYear() + "_" + hour + min + sec;

					fileName = "Video_" + userName + "_" + dateStr + "." + fileExtension;
				}
			}

			xhr.open("POST", url, true);
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("content-type", file.type);
			xhr.setRequestHeader("slug", fileName);

			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						var data = JSON.parse(xhr.response);
						if (data) {
							console.log("Document created in offline db - " + "Src: " + data.d.__metadata.media_src);

							var documentObjectUrl = data.d.__metadata.uri;

							var updateRequest = {
								Filename: fileName,
								Changedate: new Date(),
								Fullname: userFullName,
								Createdby: userName,
								Chnageby: userName
							};

							var parameters = {
								success: function() {
									this.getView().byId("documentsList").getBinding("items").refresh(true);
								}.bind(this),
								error: function(error) {
									this.errorCallBackShowInPopUp(error);
								}.bind(this),
								eTag: data.d.__metadata.etag
							};

							var updatePostUrl = documentObjectUrl.replace(this.getView().getModel().sServiceUrl, "");

							this.getView().getModel().update(updatePostUrl, updateRequest, parameters);
						}
					} else {
						console.log("Document create failed" + xhr.status);
					}
				}
			}.bind(this);

			xhr.send(file);
		},

		showDownloadButton: function(mediaIsOffline, isHybridApp, isUrl) {
			if (isUrl) {
				return false;
			}

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

		showViewButton: function(mediaIsOffline, isHybridApp, isUrl) {
			if (isUrl) {
				return true;
			}

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
	});
});