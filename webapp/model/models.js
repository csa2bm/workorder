sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			Device.isNotPhone = !Device.system.phone;
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createSyncModel: function() {
			var oModel = new JSONModel({
				SyncColor: "",
				SyncIcon: "",
				LastSyncTime: "",
				Online: false,
				PendingLocalData: false,
				IsSynching: false,
				InErrorState: false,
				Errors: [],
				OrderErrors: [],
				NoticationErrors: [],
				ErrorListContextObject: "", //The object to limit the errors shown in the error list. For instance Order
				ErrorListContextID: "" // The object ID to limit the errors shown in the error list. For instance Order ID
			});

			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},

		createAppInfoModel: function() {
			var oModel = new JSONModel({
				AppVersion: "1.2",
				AppName: "2BM Work Order",
				WebSite: "http://www.2bm.com",
				UserName: "",
				UserFirstName: "",
				UserFullName: "",
				UserPosition: "",
				UserImage: ""
			});

			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});