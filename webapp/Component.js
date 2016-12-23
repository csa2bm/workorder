sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/twobm/mobileworkorder/model/models",
	"com/twobm/mobileworkorder/components/offline/SyncManager"
], function(UIComponent, Device, models, SyncManager) {
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
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set sync model
			this.setModel(models.createSyncModel(), "syncStatusModel");
			// set settings model
			this.setModel(models.createSettingsModel(), "settingsModel");

			if (sap.hybrid) {
				// Configure status bar
				if (window.cordova.require("cordova/platform").id === "ios") {
					StatusBar.backgroundColorByName("white");
					StatusBar.styleDefault();
					StatusBar.overlaysWebView(false);
				}
				
				//Get appversion and app name
				

				// Strat the sync manager
				SyncManager.start(this.getRouter());
			}
			
			
			
			// Start the router
			this.getRouter().initialize();
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