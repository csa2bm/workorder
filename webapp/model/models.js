sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			Device.isNotPhone = !Device.system.phone;
			Device.isPhone = Device.system.phone;
			Device.isHybridApp = this.getIsHybridApp();
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
				AppVersion: "AppVersion",
				AppName: "AppName",
				WebSite: "http://www.2bm.com/2bm-mobile-work-order/",
				UserName: "",
				UserFirstName: "",
				UserFullName: "",
				UserPosition: "",
				UserImage: "",
				Persno: "",
				UILanguage: sap.ui.getCore().getConfiguration().getLanguage()
			});

			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createSelectObjectForNewNotificationModel: function() {
			var oModel = new JSONModel({
				equipmentNo: "",
				equipmentDesc: "",
				functionalLoc: "",
				funcLocDesc: ""
			});

			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},

		createTimeRegistrationTimerModel: function() {
			var oModel = new JSONModel({
				Started: false,
				OrderId: "",
				StartDateTime: ""
			});

			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},

		createLanguagesModel: function() {
			var oModel = new JSONModel({
				Languages: [{
					LanguageText: "Český",
					LanguageCode: "cs",
					Image: "images/flags/cz.png"
				}, {
					LanguageText: "中国传统",
					LanguageCode: "zh",
					Image: "images/flags/zh.png"
				}, {
					LanguageText: "Dansk",
					LanguageCode: "da",
					Image: "images/flags/da.png"
				}, {
					LanguageText: "Deutsch",
					LanguageCode: "de",
					Image: "images/flags/de.png"
				}, {
					LanguageText: "English (UK)",
					LanguageCode: "en-UK",
					Image: "images/flags/uk.png"
				}, {
					LanguageText: "English (US)",
					LanguageCode: "en-US",
					Image: "images/flags/us.png"
				}, {
					LanguageText: "España (Spain)",
					LanguageCode: "es",
					Image: "images/flags/es.png"
				}, {
					LanguageText: "España (México)",
					LanguageCode: "es-MX",
					Image: "images/flags/es.png"
				}, {
					LanguageText: "Magyar",
					LanguageCode: "hu",
					Image: "images/flags/hu.png"
				}, {
					LanguageText: "Norsk",
					LanguageCode: "no",
					Image: "images/flags/no.png"
				}, {
					LanguageText: "Svenska",
					LanguageCode: "sv",
					Image: "images/flags/se.png"
				}]
			});

			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		getIsHybridApp: function() {
			if (sap.hybrid) {
				return true;
			}
			return false;
		}
	};
});