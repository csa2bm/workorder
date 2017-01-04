sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter",
	"com/twobm/mobileworkorder/components/offline/SyncStateHandler",
	"com/twobm/mobileworkorder/components/offline/SyncManager"
], function(Controller, History, Formatter, SyncStateHandler, SyncManager) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.dashboard.Dashboard", {
		formatter: Formatter,

		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "dashboard") {
				this.getEventBus().unsubscribe("OfflineStore", "DBReinitialized", this.dbHasBeenReinitialized, this);
				return;
			}

			if (!this.DashBoardModel) {
				this.DashBoardModel = new sap.ui.model.json.JSONModel({
					notificationCount: "0",
					orderCount: "0"
				});
				this.getView().setModel(this.DashBoardModel, "DashBoardModel");
				
				this.getUserDetails();
			}

			this.getEventBus().subscribe("OfflineStore", "DBReinitialized", this.dbHasBeenReinitialized, this);

			this.setContentInTiles();
		},

		setContentInTiles: function() {
			var parametersOrder = {
				success: function(oData, oResponse) {
					this.DashBoardModel.getData().orderCount = oData;
					this.DashBoardModel.refresh();
				}.bind(this),
				error: this.errorCallBackShowInPopUp
			};
			var parametersNotif = {
				success: function(oData, oResponse) {
					this.DashBoardModel.getData().notificationCount = oData;
					this.DashBoardModel.refresh();
				}.bind(this),
				error: this.errorCallBackShowInPopUp
			};

			this.getView().getModel().read("/OrderSet/$count", parametersOrder);
			this.getView().getModel().read("/NotificationsSet/$count", parametersNotif);
		},

		getUserDetails: function() {
			var parametersUserDetails = {
				success: function(oData, oResponse) {
					this.getView().getModel("appInfoModel").getData().UserFullName = oData.results[0].Fullname;
					this.getView().getModel("appInfoModel").getData().UserFirstName = oData.results[0].Firstname;
					this.getView().getModel("appInfoModel").getData().UserName = oData.results[0].Username;
					this.getView().getModel("appInfoModel").getData().UserPosition = oData.results[0].Position;

					if (sap.hybrid) {
						this.getView().getModel("appInfoModel").getData().UserImage = oData.results[0].__metadata.media_src;
					} else {
						this.getView().getModel("appInfoModel").getData().UserImage = this.getView().getModel().sServiceUrl +
							"/UserDetailsSet('LLA')/$value";
					}
					//this.DashBoardModel.getData().ImagePath = oData.results[0].__metadata.media_src;
					//this.DashBoardModel.getData().ImagePath = this.getView().getModel().sServiceUrl + "/UserDetailsSet('LLA')/$value";

					this.getView().getModel("appInfoModel").refresh();
				}.bind(this),
				error: this.errorCallBackShowInPopUp
			};

			this.getView().getModel().read("/UserDetailsSet", parametersUserDetails);
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
			//	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//var oRouter = this.getRouter();
			//	oRouter.navTo("objectTreeList", true);
			/*window.cordova.plugins.barcodeScanner.scan(
			 function(result) {
			 if (result.cancelled === "true") {
			 return;
			 }
			 },
			 function() {
			 sap.m.MessageToast.show("Scanning failed");
			 }
			 );*/

			sap.m.MessageToast.show("Starting push registration..");

			sap.Push.registerForNotificationTypes(sap.Push.notificationType.badge | sap.Push.notificationType.sound | sap.Push.notificationType
				.alert,
				function(message) {
					sap.m.MessageToast.show("Successfully registered for push: " + message);
				},
				function(message) {
					sap.m.MessageToast.show("Failed to register for push: " + message);
				},
				function(message) {
					sap.m.MessageToast.show("Received message: " + message);
				}, "");
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

		onSettings: function(oEvent) {
			if (!this.settingsDialog) {
				this.settingsDialog = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.settings.fragments.Settings", sap.ui.controller(
					"com.twobm.mobileworkorder.components.settings.Settings"));
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this.settingsDialog.setModel(this.getView().getModel("i18n"), "i18n");
			this.settingsDialog.setModel(this.getView().getModel("appInfoModel"), "appInfoModel");
			this.settingsDialog.openBy(oEvent.getSource());
		},

		dataCount: function(oValue) {
			//read the number of data entities returned
			if (oValue) {
				return oValue.length;
			}
		},

		dbHasBeenReinitialized: function() {
			sap.ui.getCore().byId("appShell").setVisible(true); //Show data with the new downloaded data

			this.getView().getModel().refresh(true);

			this.getEventBus().publish("UpdateSyncState");
		},

		isOnline: function() {
			if (sap.hybrid) {
				return false;
			}

			return true;
		},

		onRefresh: function() {
			this.setContentInTiles();
			this.getView().getModel().refresh();
		},
		
		onPressFunctionalLocations : function()
		{
				var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				//var oRouter = this.getRouter();
				oRouter.navTo("structureBrowser", true);

			}
		}
	});
});
