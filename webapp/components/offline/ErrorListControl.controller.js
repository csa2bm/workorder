sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.offline.ErrorListControl", {
		openErrorsView: function(oEvent) {
			if (!this._errorsView) {
				this._errorsView = sap.ui.xmlfragment("errorArchiveDialog", "com.twobm.mobileworkorder.components.offline.fragments.ErrorsListPopover", this);
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
				sap.m.MessageBox.show("1");
			
			sap.m.MessageBox.show(this.getI18nText("errorListPopupDetailDeletePopupText"), {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("errorListPopupDetailDeletePopupTitle"),
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
						sap.m.MessageBox.show("2");
					
					if (oAction === sap.m.MessageBox.Action.YES) {

						var deleteErrorsURL = deletePath.replace(that.getView().getModel().sServiceUrl, "");

						var parameters = {
							success: function(evt) {
									sap.m.MessageBox.show("3");
								
								var oNavCon = sap.ui.core.Fragment.byId("errorArchiveDialog", "errorNav");
								oNavCon.back();

								that.getEventBus().publish("UpdateSyncState");
							},
							error: that.errorCallBackShowInPopUp
						};

						that.getView().getModel().remove(deleteErrorsURL, parameters);
					}
				}
			});
		}
	});
});