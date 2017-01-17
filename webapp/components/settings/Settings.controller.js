sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter",
	"com/twobm/mobileworkorder/components/offline/SyncStateHandler"
], function(Controller, History, Formatter, SyncStateHandler) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.settings.Settings", {
		formatter: Formatter,

		onResetClient : function()
		{
			//sap.m.MessageToast.show("test");
			
			var that = this;

			//this._syncQuickView.close();

			//var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			sap.m.MessageBox.show("Are you sure that you want to reset the offline database and login again?", {
				icon: sap.m.MessageBox.Icon.None,
				title: "Reset database",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				//styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						//that.closeSyncPopup();
						/*sap.ui.getCore().byId("appShell").setVisible(false); // hide app with data
						 sap.m.MessageToast.show("Resetting data and logging out");
						 DevApp.devLogon.reset();*/

						sap.hybrid.OData.offlineStore.appOfflineStore.store.close(function() {

							sap.OData.removeHttpClient();
							sap.hybrid.OData.offlineStore.appOfflineStore.store.clear(function() {
								sap.hybrid.OData.offlineStore.appOfflineStore.store = null;
								sap.hybrid.kapsel.doDeleteRegistration();
								sap.Logon.core.loadStartPage();
							});
						});
					}
				}
			});
		}
	});
});