sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter",
	"com/twobm/mobileworkorder/dev/devapp"
], function(Controller, History, Formatter, devApp) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.dashboard.Dashboard", {
		formatter: Formatter,

		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

			//	this.setNotificationModel(this);
			this.DashBoardModel = new sap.ui.model.json.JSONModel({
				notificationCount: 0,
				orderCount: 0
			});
			this.getView().setModel(this.DashBoardModel, "DashBoardModel");

		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "dashboard") {
				//We navigated to another page - unsubscribe to events for this page
				this.getEventBus().unsubscribe("OfflineStore", "Synced", this.syncCompleted, this);
				this.getEventBus().unsubscribe("DeviceOnline", this.deviceWentOnline, this);
				this.getEventBus().unsubscribe("DeviceOffline", this.deviceWentOffline, this);
				return;
			}

			self = this;

			this.getEventBus().subscribe("OfflineStore", "Synced", this.syncCompleted, this);
			this.getEventBus().subscribe("DeviceOnline", this.deviceWentOnline, this);
			this.getEventBus().subscribe("DeviceOffline", this.deviceWentOffline, this);

			this.getEventBus().publish("UpdateSyncState");

			this.setContentInTiles();

		},

		setContentInTiles: function() {
			self = this;
			// Set Dashboard Tiles model
			// if(!this.getView().getModel(self.DashBoardModel)){
			// this.getView().setModel(self.DashBoardModel,"DashBoardModel");
			// }	

			var parametersOrder = {
				success: function(oData, oResponse) {

					self.DashBoardModel.getData().orderCount = oData;
					self.DashBoardModel.refresh();

				},
				error: this.errorCallBackShowInPopUp
			};
			var parametersNotif = {
				success: function(oData, oResponse) {

					self.DashBoardModel.getData().notificationCount = oData;
					self.DashBoardModel.refresh();

				},
				error: this.errorCallBackShowInPopUp
			};

			this.getView().getModel().read("/OrderSet/$count", parametersOrder);
			this.getView().getModel().read("/NotificationsSet/$count", parametersNotif);

		},

		setNotificationModel: function(oEvent) {
			var notificationModel = new sap.ui.model.json.JSONModel();
			notificationModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			oEvent.getview().setModel(notificationModel, "NotificationModel");

		},

		onPressOtherWorkorders: function() {

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				//var oRouter = this.getRouter();
				oRouter.navTo("workOrderList", true);

			}
		},

		onPressScanObject: function() {
			cordova.plugins.barcodeScanner.scan(
				function(result) {

					if (result.cancelled === "true") {
						return;
					}

				},
				function() {
					sap.m.MessageToast.show("Scanning failed");
				}
			);
		},

		onPressNotifications: function() {

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				//var oRouter = this.getRouter();
				oRouter.navTo("notificationList", true);

			}
		},

		/*	onPressCreateNotification: function() {
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationList.controls.CreateNotificationDialog",
						this);
					this.getView().addDependent(this._oDialog);
				}
				// toggle compact style
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
				this._oDialog.open();
			},*/

		onPressCreateNotification: function() {

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var bindingPath = "/NotificationSet";
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				//var oRouter = this.getRouter();
				oRouter.navTo("notificationCreate", {
					entity: bindingPath.substr(1)
				});

			}
		},

		/*	onPressCreateNotification: function(oEvent){
		
		
			
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationList.controls.CreateNotificationDialog", this);

				this._oPopover.setModel(this.CreateNotificationModel, "CreateNotificationModel");
				this.getView().addDependent(this._oPopover);
			}
			
			this._oPopover.getModel("CreateNotificationModel").refresh();
			


			this._oPopover.openBy(oEvent.getSource());
	
			
		},*/

		handleSaveNotification: function(oEvent) {
			//Handles that Finish is also changed. StartDate is handled with twoway binding

			var oContext = oEvent.getSource().getBindingContext();
			var newStartDateString = this._oPopover.getModel("CreateNotificationModel").getData().Date;

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd-MM-yyyy"
			});
			var newStartDate = dateFormat.parse(newStartDateString, true, true);

			if (newStartDate) {
				//Date is valid
				this.getView().getModel().setProperty("Date", newStartDate, oContext);

				oEvent.oDialog.close();
			}
		},

		handleCloseNotificationDialog: function() {
			if (this._oDialog) {
				this._oDialog.close();
			}
		},

		//These event are event from the odata service
		//In offline scenario we are not interesting in these
		//as it is more important that the data has been synced to the backend
		subscribeToOnlineSyncEvents: function() {
			//subscribe to sync events
			self.getView().getModel().attachRequestCompleted(self.syncCompleted);
			self.getView().getModel().attachRequestFailed(self.syncFailed);
		},

		unSubscribeToOnlineSyncEvents: function() {
			//Unsubscribe to sync events
			self.getView().getModel().detachRequestCompleted(self.syncCompleted);
			self.getView().getModel().detachRequestFailed(self.syncFailed);
		},

		syncCompleted: function() {
			if (window.sap_webide_FacadePreview) {
				self.unSubscribeToOnlineSyncEvents();

				//Update syncStatusModel
				// var syncStatusModel = self.getView().getModel("syncStatusModel");
				// var d = new Date();
				// syncStatusModel.getData().LastSyncTime = d.toLocaleString();

				// syncStatusModel.getData().Online = true; //always online in webide

				// syncStatusModel.refresh();

				//Update sync state indicator
				//SyncStateHandler.handleSyncState();
			} else {
				//sap.m.MessageToast.show("Data synchronized with server");
			}

			self.setSyncIndicators(false);

			//Update items in table
			//self.getView().byId("workOrderTableId").getBinding("items").refresh(true);
		},

		syncFailed: function() {
			if (window.sap_webide_FacadePreview) {
				self.unSubscribeToOnlineSyncEvents();
			} else {
				//sap.m.MessageToast.show("Synchronization with server failed");
			}

			self.setSyncIndicators(false);
		},

		/**
		 * refreshing offline store data
		 */
		refreshData: function() {
			var model = this.getView().getModel();

			if (model.hasPendingChanges() || model.newEntryContext) {
				if (devApp.isLoaded) {
					if (devApp.isOnline) {
						//Show sync busy indicator
						self.setSyncIndicators(true);

						self.flushAndRefresh();
						//this.getEventBus().publish("OfflineStore", "Refreshing");
					} else {
						//sap.m.MessageToast.show("Offline: not able to sync");
						model.refresh();
					}
				} else {
					model.refresh();
				}
			} else {
				if (devApp.isLoaded) {
					if (devApp.isOnline) {
						self.setSyncIndicators(true);

						self.flushAndRefresh();
						//this.getEventBus().publish("OfflineStore", "Refreshing");
					} else {
						//sap.m.MessageToast.show("Device is ");
						model.refresh();
					}
				} else {
					model.refresh();
				}
			}
		},

		setSyncIndicators: function(isSynching) {
			self.getView().byId("syncBusyIndicator").setVisible(isSynching);
		},

		deviceWentOnline: function() {
			self.setSyncIndicators(true);

			self.flushAndRefresh();
		},

		deviceWentOffline: function() {
			self.setSyncIndicators(false);
		},

		flushAndRefresh: function() {
			if (devApp.isOnline) {
				//console.log("refreshing oData Model with offline store");
				//ask refreshing store after flush
				//devApp.refreshing = true;
				if (devApp.devLogon) {
					//console.log("refreshing offline store");
					devApp.devLogon.flushAppOfflineStore();
				}
			} else {
				//Update data in views
				this.getView().getModel().refresh();
			}
		},

		showSyncQuickview: function(oEvent) {
			//if (!window.sap_webide_FacadePreview) {
			this.createPopover();

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._syncQuickView.openBy(oButton);
			});
			//	}
		},

		createPopover: function() {
			if (!this._syncQuickView) {
				this._syncQuickView = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderList.controls.SyncQuickView", this);
				this.getView().addDependent(this._syncQuickView);
			}
		},

		synchronizeData: function() {
			if (this._syncQuickView) {
				this._syncQuickView.close();
			}

			if (window.sap_webide_FacadePreview || devApp.isOnline) {

				if (window.sap_webide_FacadePreview) {
					this.subscribeToOnlineSyncEvents();
				}

				this.setSyncIndicators(true);

				this.flushAndRefresh();
			} else {
				sap.m.MessageToast.show("Device is offline");
			}
		},

		closeSyncPopup: function() {
			if (this._syncQuickView) {
				this._syncQuickView.close();
			}
		},

		dataCount: function(oValue) {
			//read the number of data entities returned
			if (oValue) {
				return oValue.length;
			}

		},

		resetStore: function() {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			sap.m.MessageBox.show("Are you sure that you want to reset the offline database and login again?", {
				icon: sap.m.MessageBox.Icon.None,
				title: "Reset database",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {

						sap.m.MessageToast.show("Resetting store");
						devApp.devLogon.reset();
					}
				}
			});
		},

		openErrorsView: function(oEvent) {
			if (!this._errorsView) {
				this._errorsView = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.app.ErrorArchive", this);
				this.getView().addDependent(this._errorsView);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._errorsView.open();
			});
		},

		closeErrorListPopupButton: function() {
			if (this._errorsView) {
				this._errorsView.close();
			}
		},
	});
});