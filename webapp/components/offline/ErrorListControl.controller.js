sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.offline.ErrorListControl", {
		openErrorsView: function(oEvent) {
			if (!this._errorsView) {

				this._errorsView = sap.ui.xmlfragment("errorArchiveDialog",
					"com.twobm.mobileworkorder.components.offline.fragments.ErrorsListPopover", this);
				this.getView().addDependent(this._errorsView);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._errorsView.open();
			});
		},

		closeErrorListPopupButton: function() {
			if (this._errorsView) {
				this._errorsView.close();
			}
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

			// var serviceUrl = sap.ui.getCore().getComponent("__component0").getModel().sServiceUrl;
			// var errorsUrl = serviceUrl + "/ErrorArchive";

			// var request = {
			// 	headers: {},
			// 	requestUri: errorsUrl,
			// 	method: "GET"
			// };

			// OData.read(request,
			// 	function(data, response) {

			// 	});

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
							requestUri: deletePath,
							method: "DELETE"
						};

						OData.read(request,
							function(data, response) {
								var oNavCon = sap.ui.core.Fragment.byId("errorArchiveDialog", "errorNav");
								oNavCon.back();
								
								//that.getEventBus().publish("UpdateSyncState");
								that.getEventBus().publish("OfflineStore", "Synced");
							}, this.errorCallBackShowInPopUp);

						// var deleteErrorsURL = deletePath.replace(that.getView().getModel().sServiceUrl, "");
						// sap.m.MessageBox.show(deleteErrorsURL);
						// var parameters = {
						// 	success: function(evt) {

						// 		var oNavCon = sap.ui.core.Fragment.byId("errorArchiveDialog", "errorNav");
						// 		oNavCon.back();

						// 		that.getEventBus().publish("UpdateSyncState");
						// 	},
						// 	error: that.errorCallBackShowInPopUp
						// };
						// sap.m.MessageBox.show(that.getView().getModel().sServiceUrl);
						// that.getView().getModel().remove(deleteErrorsURL, parameters);
					}
				}
			});
		}
	});
});