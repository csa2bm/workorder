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
				UILanguage: sap.ui.getCore().getConfiguration().getLanguage(),
				UILanguageText: ""
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
					LanguageCode: ["cs", "cs-CZ"],
					LanguageText: "Český",
					Image: "images/flags/cz.png"
				}, {
					LanguageCode: ["zh", "zh-CN"],
					LanguageText: "中国传统",
					Image: "images/flags/zh.png"
				}, {
					LanguageCode: ["da", "da-DK"],
					LanguageText: "Dansk",
					Image: "images/flags/da.png"
				}, {
					LanguageCode: ["de", "de-DE"],
					LanguageText: "Deutsch",
					Image: "images/flags/de.png"
				}, {
					LanguageCode: ["en", "en-GB"],
					LanguageText: "English (UK)",
					Image: "images/flags/uk.png"
				}, {
					LanguageCode: ["en-US"],
					LanguageText: "English (US)",
					Image: "images/flags/us.png"
				}, {
					LanguageCode: ["es", "es-ES"],
					LanguageText: "España (Spain)",
					Image: "images/flags/es.png"
				}, {
					LanguageCode: ["es-MX"],
					LanguageText: "España (México)",
					Image: "images/flags/es.png"
				}, {
					LanguageCode: ["hu", "hu-HU"],
					LanguageText: "Magyar",
					Image: "images/flags/hu.png"
				}, {
					LanguageCode: ["no", "nb-NO"],
					LanguageText: "Norsk",
					Image: "images/flags/no.png"
				}, {
					LanguageCode: ["sv", "sv-SE"],
					LanguageText: "Svenska",
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