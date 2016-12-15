sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/twobm/mobileworkorder/util/SyncStateHandler",
	"com/twobm/mobileworkorder/components/offline/SyncManager"
], function(Controller, SyncStateHandler, SyncManager) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.offline.Status", {

		showSyncQuickview: function(oEvent) {
			this.createPopover();

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._syncQuickView.openBy(oButton);
			});
		},

		createPopover: function() {
			if (!this._syncQuickView) {
				this._syncQuickView = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.offline.fragments.SyncQuickView", this);
				this.getView().addDependent(this._syncQuickView);
			}
		},

		synchronizeData: function() {
			if (this._syncQuickView) {
				this._syncQuickView.close();
			}

			if (sap.hybrid.SMP.isOnline) {
				SyncManager.sync();
			} else {
				sap.m.MessageToast.show("Device is offline");
			}
		},

		resetStore: function() {
			var that = this;

			this._syncQuickView.close();

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			sap.m.MessageBox.show("Are you sure that you want to reset the offline database and login again?", {
				icon: sap.m.MessageBox.Icon.None,
				title: "Reset database",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						that.closeSyncPopup();
						sap.ui.getCore().byId("appShell").setVisible(false); // hide app with data
						sap.m.MessageToast.show("Resetting data and logging out");
						DevApp.devLogon.reset();
					}
				}
			});
		},
		
		showErrorsList : function(){
			var data = {
				"Object" : "", //Show all errors
				"ID" : "" //Show all errors
			};

			sap.ui.getCore().getEventBus().publish("ShowErrorList", data);	
		},
		
			openErrorsView: function() {
			this.getView().getModel("syncStatusModel").getData().ErrorListContextObject = "";
			this.getView().getModel("syncStatusModel").getData().ErrorListContextID = "";
			this.getView().getModel("syncStatusModel").refresh();

			if (!this._errorsView) {

                             var idPrefix = this.getView().createId("errorList");
				var controller = sap.ui.controller("com.twobm.mobileworkorder.components.offline.ErrorListControl");
				this._errorsView = sap.ui.xmlfragment(idPrefix,
					"com.twobm.mobileworkorder.components.offline.fragments.ErrorsListPopover", controller);
				controller.dialog = this._errorsView;
                             controller.idPrefix = idPrefix;
				this.getView().addDependent(this._errorsView);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			// var oButton = oEvent.getSource();
			// jQuery.sap.delayedCall(0, this, function() {
			this._errorsView.open();
			// });
		},

		closeSyncPopup: function() {
			if (this._syncQuickView) {
				this._syncQuickView.close();
			}
		}
	});
});
