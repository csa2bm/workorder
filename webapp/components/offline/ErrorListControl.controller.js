sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.offline.ErrorListControl", {
		
		dialog:  null,
        idPrefix: null,

		closeErrorListPopupButton: function(oEvent) {
			this.dialog.close();
		},
		
		closeErrorListDetailPopupButton: function() {
			//Go back.
			var oNavCon = sap.ui.core.Fragment.byId(this.idPrefix, "errorNav");
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
			var oNavCon = sap.ui.core.Fragment.byId(this.idPrefix, "errorNav");
			var oDetailPage = sap.ui.core.Fragment.byId(this.idPrefix, "errorDetail");
			oNavCon.to(oDetailPage);
			oDetailPage.bindElement({
				path: oCtx.getPath(),
				model: "syncStatusModel"
			});
		},

		onErrorNavBack: function() {
			var oNavCon = sap.ui.core.Fragment.byId(this.idPrefix, "errorNav");
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
			//var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			sap.m.MessageBox.show(this.getI18nText("errorListPopupDetailDeletePopupText"), {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("errorListPopupDetailDeletePopupTitle"),
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				//styleClass: bCompact ? "sapUiSizeCompact" : "",
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
								var oNavCon = sap.ui.core.Fragment.byId(this.idPrefix, "errorNav");
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
		}
	});
});