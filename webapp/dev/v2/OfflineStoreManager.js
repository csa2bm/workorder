sap.ui.define([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"sap/m/MessageBox"
], function(Shell, ComponentContainer, MessageBox) {
	"use strict";

	return {
		offlineStore: {},

		initialize: function(configuration) {
			// Build initial context with prepopulated settings for login plugin
			var initialContext = this.buildContext(configuration);
			// Start the login process
			sap.Logon.init(
				function(context) {
					// Initialize the offline store with the context returned by the login plugin
					this.setupOfflineStore(context);
				},
				function(error) {
					// Something went wrong
				}, this.configuration.applicationId, initialContext);
		},

		setupOfflineStore: function(configuration, context) {
			// Create the offline store based on configuration and the supplied context
			this.offlineStore = sap.OData.createOfflineStore({
				"name": "OfflineStore",
				"host": context.registrationContext.serverHost,
				"port": context.registrationContext.serverPort,
				"https": context.registrationContext.https,
				"serviceRoot": context.applicationEndpointURL + "/",
				"definingRequests": configuration.definingRequests
			});

			// Open the offline store
			this.appOfflineStore.store.open(
				function() {
					// Apply HttpClient to redirect service calls to the offline store
					sap.OData.applyHttpClient();
				},
				function(e) {
					// Something went wrong
					sap.m.MessageBox.alert("An error occurred: " + JSON.stringify(e));
				});
		},

		buildContext: function(configuration) {
			return {
				"serverHost": configuration.prepopulatedHost,
				"https": true,
				"serverPort": 443
			};
		},

		flushAndRefresh: function() {
			// Check offline store for local changes
			this.offlineStore.getRequestQueueStatus(
				function(status) {
					// If request queue is not empty..
					if (!status.isEmpty) {
						//..flush changes
						sap.ui.getCore().getEventBus().publish("OfflineStore", "FlushStarted");
						this.offlineStore.flush(function() {
							// Publish flush completed event
							sap.ui.getCore().getEventBus().publish("OfflineStore", "FlushCompleted");
							// Always refresh after flush
							this.refreshOfflineStore();
						}, function(error) {
							// Something went wrong
						});
					} else {
						//..else if a push message was received while we were not interested, do a refresh now
						if (this.pendingPush) {
							this.RefreshOfflineStore();
						}
					}
				},
				function(error) {
					// Something went wrong
				});
		},

		refreshOfflineStore: function() {
			// Refresh the offline store
			sap.ui.getCore().getEventBus().publish("OfflineStore", "RefreshStarted");
			this.offlineStore.refresh(function() {
					sap.ui.getCore().getEventBus().publish("OfflineStore", "RefreshCompleted");
				},
				function(error) {
					// Something went wrong
				});
		}
	};
});