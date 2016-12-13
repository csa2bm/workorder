sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/SyncStateHandler"
], function(Fragment, MessageBox, Controller, devApp, SyncStateHandler) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.app.App", {
		/**
		 * initializing controller, subscribe two "OfflineStore" channel event
		 */
		onInit: function() {
			var oEventBus = this.getEventBus();
			oEventBus.subscribe("OfflineStore", "Synced", this.syncCompleted, this);
			oEventBus.subscribe("DeviceOnline", this.handleConnected, this);
			oEventBus.subscribe("DeviceOffline", this.handleDisconnected, this);

			oEventBus.subscribe("UpdateSyncState", SyncStateHandler.handleSyncState, this);

			oEventBus.subscribe("ShowErrorList", this.openErrorsView, this);

			//Add Content Density Style Class
			//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		/**
		 * UI5 OfflineStore channel Synced event handler, after refreshing offline store, refresh data model
		 */
		syncCompleted: function() {
			this.getView().getModel().refresh();

			//Update syncStatusModel
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			var d = new Date();
			syncStatusModel.getData().LastSyncTime = d.toLocaleString();

			if (window.sap_webide_FacadePreview) {
				syncStatusModel.getData().Online = true; //always online in webide
			}
			syncStatusModel.refresh();
			
			this.setSyncIndicators(false);

			//Update sync state indicator
			SyncStateHandler.handleSyncState();
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

		openErrorsView: function(channel, eventId, data) {
			this.getView().getModel("syncStatusModel").getData().ErrorListContextObject = data.Object;
			this.getView().getModel("syncStatusModel").getData().ErrorListContextID = data.ID;
			this.getView().getModel("syncStatusModel").refresh();

			if (!this._errorsView) {
				this._errorsView = sap.ui.xmlfragment("errorArchiveDialog",
					"com.twobm.mobileworkorder.components.offline.fragments.ErrorsListPopover", this);
				this.getView().addDependent(this._errorsView);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			// var oButton = oEvent.getSource();
			// jQuery.sap.delayedCall(0, this, function() {
			this._errorsView.open();
			// });
		},

		closeErrorListPopupButton: function() {
			if (this._errorsView) {
				this._errorsView.close();
			}
		},

		closeErrorListDetailPopupButton: function() {
			//Go back.
			var oNavCon = sap.ui.core.Fragment.byId("errorArchiveDialog", "errorNav");
			oNavCon.back();

			if (this._errorsView) {
				this._errorsView.close();
			}
		},

		onRetrySync: function() {
			this.closeErrorListPopupButton();
			this.getEventBus().publish("OfflineStore", "Synced");
		},

		onNavtoErrDetail: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext("syncStatusModel");
			var oNavCon = sap.ui.core.Fragment.byId("errorArchiveDialog", "errorNav");
			var oDetailPage = sap.ui.core.Fragment.byId("errorArchiveDialog", "errorDetail");
			oNavCon.to(oDetailPage);
			oDetailPage.bindElement({
				path: oCtx.getPath(),
				model: "syncStatusModel"
			});
		},

		onErrorNavBack: function() {
			var oNavCon = sap.ui.core.Fragment.byId("errorArchiveDialog", "errorNav");
			oNavCon.back();
		},

		onDelBTVisible: function(errCount) {
			var bShow = false;
			if (errCount > 0) {
				bShow = true;
			}

			return bShow;
		},

		onDeleteErrRecord: function(oEvent) {
			var deletePath = oEvent.getSource().getBindingContext("syncStatusModel").getObject().ErrorUrl;
			var that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			sap.m.MessageBox.show(this.getI18nText("errorListPopupDetailDeletePopupText"), {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("errorListPopupDetailDeletePopupTitle"),
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {

					if (oAction === sap.m.MessageBox.Action.YES) {
						var deleteErrorsURL = deletePath.replace(that.getView().getModel().sServiceUrl, "");

						var request = {
							headers: {},
							requestUri: deleteErrorsURL,
							method: "DELETE"
						};

						OData.read(request,
							function(data, response) {
								var oNavCon = sap.ui.core.Fragment.byId("errorArchiveDialog", "errorNav");
								oNavCon.back();

								//that.getEventBus().publish("UpdateSyncState");
								that.getEventBus().publish("OfflineStore", "Synced");
							}, this.errorCallBackShowInPopUp);
					}
				}
			});
		},

		isErrorRelevantForContext: function(errorListContextObject, errorListContextID, errorObject, errorObjectID) {
			//If errorListContextObject and errorListContextID is defined then we need to check
			//for each error in the error list whether it has to be shown in error list
			//when opening. 
			//errorListContextObject and errorListContextID defines that only error relevant for this context must be visible

			if (errorListContextObject !== "") {
				if (errorListContextObject === errorObject && errorListContextID === errorObjectID) {
					return true; //visible
				} else {
					return false; //not visible
				}
			} else {
				return true; //There is no limited context. Show all errors
			}
		},
		
		setSyncIndicators: function(isSynching) {
			var syncStatusModel = this.getView().getModel("syncStatusModel");
			syncStatusModel.getData().IsSynching = isSynching;
			syncStatusModel.refresh();
		},

		deviceWentOnline: function() {
			this.setSyncIndicators(true);

			this.flushAndRefresh();
		},

		deviceWentOffline: function() {
			this.setSyncIndicators(false);
		},

		flushAndRefresh: function() {
			if (devApp.isOnline) {
				//ask refreshing store after flush
				if (devApp.devLogon) {
					//console.log("refreshing offline store");
					devApp.devLogon.flushAppOfflineStore();
				}
			} else {
				//Update data in views
				this.getView().getModel().refresh();
			}
		}
	});
});