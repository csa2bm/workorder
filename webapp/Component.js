sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"com/twobm/mobileworkorder/dev/devapp"
], function(UIComponent, ODataModel, JSONModel, Device, devapp) {
	"use strict";

	return UIComponent.extend("com.twobm.mobileworkorder.Component", {
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the resource and application models are set and the router is initialized.
		 */
		init: function() {
			var oModel, appContext, sServiceUrl;
			//create odata model for kapsel application
			var param = {
				"json": true,
				loadMetadataAsync: true,
				useBatch: true,
				refreshAfterChange: true
			};

			if (window.cordova && !window.sap_webide_FacadePreview && !window.sap_webide_companion) {
				if (devapp.devLogon) {
					appContext = devapp.devLogon.appContext;
				}
				sServiceUrl = appContext.applicationEndpointURL + "/";
				var oHeader = {
					"X-SMP-APPCID": appContext.applicationConnectionId
				};
				if (appContext.registrationContext.user) {
					oHeader.Authorization = "Basic " + btoa(appContext.registrationContext.user + ":" + appContext.registrationContext.password);
				}
				param.headers = oHeader;
			} else {
				var appMeta = this.getMetadata().getManifestEntry("sap.app");
				sServiceUrl = appMeta.dataSources.mainService.uri;
			}
			oModel = new ODataModel(sServiceUrl, param);
			oModel.setDefaultBindingMode("TwoWay");
			this.setModel(oModel);
			devapp.appModel = oModel;

			//Create sync status model
			var syncStatusModel = new sap.ui.model.json.JSONModel({
				SyncColor: "",
				LastSyncTime: "",
				Online: false,
				PendingLocalData: false,
				Errors: []
			});
			syncStatusModel.setDefaultBindingMode("TwoWay");
			this.setModel(syncStatusModel, "syncStatusModel");

			// set device model
			var oDeviceModel = new JSONModel({
				isTouch: Device.support.touch,
				isNoTouch: !Device.support.touch,
				isPhone: Device.system.phone,
				listMode: Device.system.phone ? "None" : "SingleSelectMaster",
				listItemType: Device.system.phone ? "Active" : "Inactive",
				isOffline: Device.system.phone ? !devapp.isOnline : false,
				errorNum: 0
			});
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			if (window.cordova) {
				devapp.deviceModel = oDeviceModel;
			}

			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();

			//check errorArchive count
			if (devapp.isLoaded) {
				devapp.devLogon.getErrorArchiveCount();
				
				if ((navigator.network.connection.type).toUpperCase() !== "NONE" &&
					(navigator.network.connection.type).toUpperCase() !== "UNKNOWN") {
					devapp.isOnline = true;

					var eventBus = sap.ui.getCore().getEventBus();
					eventBus.publish("DeviceOnline");
				}
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