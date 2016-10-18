sap.ui.define([

	"com/twobm/mobileworkorder/dev/OfflineStoreManager"
], function(OfflineStoreManager) {
	"use strict";

	return {
		isOnline: false,

		initialize: function() {
			// Bind cordova events
			this.bindEvents();
		},

		bindEvents: function() {
			// Hook up event listeners for cordova events
			document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
			document.addEventListener("online", this.onDeviceOnline.bind(this), false);
			document.addEventListener("offline", this.onDeviceOffline.bind(this), false);
		},

		onDeviceReady: function() {
			// When cordova is ready, initialize the OfflineStoreManager (this will trigger login if needed)
			OfflineStoreManager.initialize(this.loadConfiguration());
		},

		onDeviceOnline: function() {
			// Device came online
			this.isOnline = true;
			OfflineStoreManager.flushAndRefresh();
		},

		onDeviceOffline: function() {
			// Device went offline
			this.isOnline = false;
		},

		synchronizeIfNeeded : function()
		{
			// Let OfflineStoreManager handle synchronization
			OfflineStoreManager.flushAndRefresh();
		},

		loadConfiguration: function() {
			return {
				applicationId: "",
				definingRequests: "",
				prepopulatedHost: ""
			};
		}
	};
});