sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/SyncStateHandler"
], function(Fragment, MessageBox, Controller, devapp, SyncStateHandler) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.app.App", {
		/**
		 * initializing controller, subscribe two "OfflineStore" channel event
		 */
		onInit: function() {
			var oEventBus = this.getEventBus();
			oEventBus.subscribe("OfflineStore", "Synced", this.syncFinished, this);
			oEventBus.subscribe("DeviceOnline", this.handleConnected, this);
			oEventBus.subscribe("DeviceOffline", this.handleDisconnected, this);

			oEventBus.subscribe("UpdateSyncState", SyncStateHandler.handleSyncState, this);

			oEventBus.subscribe("OfflineStore", "OpenErrDialog", this.openErrDialog, this);
			this._sErrorText = this.getResourceBundle().getText("errorText");

			//Add Content Density Style Class
			//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		/**
		 * UI5 OfflineStore channel Synced event handler, after refreshing offline store, refresh data model
		 */
		syncFinished: function() {
			this.getView().getModel().refresh();

			//Update syncStatusModel
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			var d = new Date();
			syncStatusModel.getData().LastSyncTime = d.toLocaleString();

			if (window.sap_webide_FacadePreview) {
				syncStatusModel.getData().Online = true; //always online in webide
			}
			syncStatusModel.refresh();

			//Update sync state indicator
			SyncStateHandler.handleSyncState();

			// var errorNum = devapp.deviceModel.getProperty("/errorNum");
			// if (errorNum > 0) {
			// 	if (!this._errDlg) {
			// 		this._errDlg = sap.ui.xmlfragment("errorArchiveDialog", "com.2bm.mobileworkorder.components.app.ErrorArchive", this);
			// 		this.getView().addDependent(this._errDlg);
			// 	}
			// 	this._errDlg.open();
			// } else if (devapp.devLogon.appOfflineStore.callbackError) {
			// 	MessageBox.alert(JSON.stringify(devapp.devLogon.appOfflineStore.callbackError));
			// }
			// devapp.devLogon.appOfflineStore.callbackError = null;
		},

		handleDisconnected: function() {
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			syncStatusModel.getData().Online = false;

			SyncStateHandler.handleSyncState();
		},

		handleConnected: function() {
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			syncStatusModel.getData().Online = true;
			//syncStatusModel.refresh(true);

			SyncStateHandler.handleSyncState();
		},

		onNavtoErrDetail: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oNavCon = Fragment.byId("errorArchiveDialog", "errorNav");
			var oDetailPage = Fragment.byId("errorArchiveDialog", "errorDetail");
			oNavCon.to(oDetailPage);
			oDetailPage.bindElement(oCtx.getPath());
		},

		onErrorNavBack: function() {
			var oNavCon = Fragment.byId("errorArchiveDialog", "errorNav");
			oNavCon.back();
		},

		onDelBTVisible: function(errCount) {
			var bShow = false;
			if (errCount > 0) {
				bShow = true;
			}

			return bShow;
		},

		onDeleteErrRecord: function() {
			if (devapp.devLogon.appOfflineStore.errorArchiveRowURL) {
				var model = this.getView().getModel();
				model.remove(devapp.devLogon.appOfflineStore.errorArchiveRowURL, {
					success: function() {
						//clean errorNum
						devapp.deviceModel.setProperty("/errorNum", 0);
						devapp.devLogon.appOfflineStore.errorArchiveRowURL = null;
					},
					error: function(error) {
						MessageBox.alert(JSON.stringify(error));
					}
				});
			}
		},

		openErrDialog: function() {
			if (!this._errDlg) {
				this._errDlg = sap.ui.xmlfragment("errorArchiveDialog", "com.twobm.mobileworkorder.components.app.ErrorArchive", this);
				this.getView().addDependent(this._errDlg);
			}
			this._errDlg.open();
		},

		onErrDlgClose: function() {
			this._errDlg.close();
		},

		onFormatTitle: function(requestMethod) {
			var title = "Error";
			if (requestMethod.toLowerCase() === "delete") {
				title = "Warning";
			}
			return title;
		}
	});
});