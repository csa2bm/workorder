sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createSyncModel: function(){
			var oModel = new JSONModel({
				SyncColor: "",
				LastSyncTime: "",
				Online: false,
				PendingLocalData: false,
				IsSynching: false,
				InErrorState: false,
				Errors: [],
				OrderErrors: [],
				NoticationErrors: [],
				ErrorListContextObject : "", //The object to limit the errors shown in the error list. For instance Order
				ErrorListContextID : "" // The object ID to limit the errors shown in the error list. For instance Order ID
			});
			
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		}

	};
});