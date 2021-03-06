sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/twobm/mobileworkorder/model/models",
	"com/twobm/mobileworkorder/components/offline/SyncManager"
], function(UIComponent, Device, models, SyncManager) {
	"use strict";

	return UIComponent.extend("com.twobm.mobileworkorder.Component", {
		metadata: {
			manifest: "json",
			includes: [
				"css/style.css"
			]
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the resource and application models are set and the router is initialized.
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			window.componentId = this.getId();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set sync model
			this.setModel(models.createSyncModel(), "syncStatusModel");
			// set settings model
			this.setModel(models.createAppInfoModel(), "appInfoModel");

			// set createSelectObjectForNewNotificationModel model
			this.setModel(models.createSelectObjectForNewNotificationModel(), "selectObjectForNewNotificationModel");

			// set createTimeRegistrationTimerModel
			this.setModel(models.createTimeRegistrationTimerModel(), "timeRegistrationTimerModel");

			// set createLanguagesModel
			this.setModel(models.createLanguagesModel(), "languagesModel");

			var appInfoModel = this.getModel("appInfoModel");
			var syncStatusModel = this.getModel("syncStatusModel");
			var timeRegistrationTimerModel = this.getModel("timeRegistrationTimerModel");

			//Set running timer info
			var timerRunningCache = this.getTimerRunningInfoInBrowserCache();
			if (timerRunningCache) {
				timeRegistrationTimerModel.setData(timerRunningCache);
				timeRegistrationTimerModel.refresh();
			}

			this.handlePreferedUILanguage(appInfoModel);

			if (sap.hybrid) {
				// Configure status bar
				if (window.cordova.require("cordova/platform").id === "ios") {
					StatusBar.backgroundColorByName("white");
					StatusBar.styleDefault();
					StatusBar.overlaysWebView(false);
				}

				//Get appversion and app name

				cordova.getAppVersion.getVersionNumber(function(version) {
					appInfoModel.getData().AppVersion = version;

				});

				cordova.getAppVersion.getAppName(function(appName) {
					appInfoModel.getData().AppName = appName;
				});

				//Set last sync time 
				syncStatusModel.getData().LastSyncTime = this.getLastSyncTimeInBrowserCache();
				syncStatusModel.refresh();

				// Strat the sync manager
				SyncManager.start(this.getRouter());
			}

			// Start the router
			this.getRouter().initialize();
		},

		handlePreferedUILanguage: function(appInfoModel) {
			var selectedUILanguage = this.getSelectedUILanguageInBrowserCache();
			if (selectedUILanguage) {
				appInfoModel.getData().UILanguage = selectedUILanguage;
				sap.ui.getCore().getConfiguration().setLanguage(selectedUILanguage.LanguageCode[0]);

				//FORCE THE ODATA SERVICE TO LOGIN IN DEFINED LANGUAGE
				// var metadataUrlParams = {
				// 	"sap-language": selectedUILanguage.LanguageCode[0]
				// };

				// var oModel= new sap.ui.model.odata.v2.ODataModel(this.getModel().sServiceUrl, {
				// 	metadataUrlParams: metadataUrlParams,
				// 	header: this.getModel().getHeaders(),
				// 	defaultBindingMode: this.getModel().getDefaultBindingMode()
				// });
				
				// this.setModel(oModel);
			} else {
				//This is when the user has never selected a preferred UI language (Browser default is OK)

				//Get the browser default language 
				var browserLanguage = sap.ui.getCore().getConfiguration().getLanguage();

				//Find whether browser language is supported by application i18n files
				var languagesModel = this.getModel("languagesModel");

				var found = false;
				for (var i = 0; i < languagesModel.getData().Languages.length; i++) {
					var language = languagesModel.getData().Languages[i];
					if (language.LanguageCode.indexOf(browserLanguage) > -1) {
						found = true;
						appInfoModel.getData().UILanguage = language;
						break;
					}
				}

				if (!found) {
					//If language is not found set the language to english
					var englishDefault = {
						LanguageCode: ["en"],
						LanguageText: "English",
						Image: "/images/flags/uk.png"
					};

					appInfoModel.getData().UILanguage = englishDefault;
				}
			}

			appInfoModel.refresh();
		},

		getLastSyncTimeInBrowserCache: function() {
			jQuery.sap.require("jquery.sap.storage");
			//Get Storage object to use
			if (jQuery.sap.storage.isSupported()) {
				var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

				// Set value in htlm5 storage 
				return oStorage.get("LastSyncTime");
			} else {
				return "";
			}
		},

		getTimerRunningInfoInBrowserCache: function() {
			jQuery.sap.require("jquery.sap.storage");
			//Get Storage object to use
			if (jQuery.sap.storage.isSupported()) {
				var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

				var timerRunningInfo = oStorage.get("OrderTimer");

				if (!timerRunningInfo) {
					return null;
				} else {
					return timerRunningInfo;
				}
			} else {
				return "";
			}
		},

		getSelectedUILanguageInBrowserCache: function() {
			jQuery.sap.require("jquery.sap.storage");
			//Get Storage object to use
			if (jQuery.sap.storage.isSupported()) {
				var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

				// Set value in htlm5 storage 
				return oStorage.get("SelectedUILanguage");
			} else {
				return "";
			}
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});