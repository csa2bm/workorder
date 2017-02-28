sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter",
	"com/twobm/mobileworkorder/components/offline/SyncStateHandler",
	"com/twobm/mobileworkorder/components/offline/SyncManager",
	"sap/m/MessageBox",
	"sap/ui/core/format/NumberFormat"
], function(Controller, History, Formatter, SyncStateHandler, SyncManager, MessageBox, NumberFormat) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.dashboard.Dashboard", {
		formatter: Formatter,

		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
			//this.getRouter().getRoute("dashboard").attachMatched(this.onRouteMatched, this);

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("OfflineStore", "Updated", this.setContentInTiles, this);

			eventBus.subscribe("BlockNavigation", this.performNavigationForBlocks, this);
		},

		onRouteMatched: function(oEvent) {
			if (!this.DashBoardModel) {
				this.DashBoardModel = new sap.ui.model.json.JSONModel({
					notificationCount: "0",
					orderCount: "0"
				});
				this.getView().setModel(this.DashBoardModel, "DashBoardModel");

				this.getUserDetails();

				// //Show Browser and configuration language
				// sap.m.MessageToast.show(
				// 	"Browser language: " + window.navigator.language + "\n" +
				// 	"Core config language: " + sap.ui.getCore().getConfiguration().getLanguage() + "\n" +
				// 	"Format locale: " + sap.ui.getCore().getConfiguration().getFormatLocale() + "\n" +
				// 	"SAP Logon language: " + sap.ui.getCore().getConfiguration().getSAPLogonLanguage()
				// );
			}

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
					if (oData.results.length > 0) {
						this.getView().getModel("appInfoModel").getData().UserFullName = oData.results[0].Fullname;
						this.getView().getModel("appInfoModel").getData().UserFirstName = oData.results[0].Firstname;
						this.getView().getModel("appInfoModel").getData().UserName = oData.results[0].Username;
						this.getView().getModel("appInfoModel").getData().UserPosition = oData.results[0].Position;
						this.getView().getModel("appInfoModel").getData().Persno = oData.results[0].Persno;

						if (sap.hybrid) {
							this.getView().getModel("appInfoModel").getData().UserImage = oData.results[0].__metadata.media_src;
						} else {
							this.getView().getModel("appInfoModel").getData().UserImage = this.getView().getModel().sServiceUrl +
								"/UserDetailsSet('" + this.getView().getModel("appInfoModel").getData().UserName + "')/$value";
						}
					}

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
			var isHybridApp = this.getView().getModel("device").getData().isHybridApp;
			if (isHybridApp) {
				cordova.plugins.barcodeScanner.scan(
					function(result) {
						if (result.cancelled) {
							return;
						} else {

							var scannedEquipmentId = result.text;
							var onDataReceived = {
								success: function(oData, oResponse) {
									var equipmentNo = oData.Equipment;
									var isFuncLoc = false;
									this.ShowEquipmentDetailsWithId(equipmentNo, isFuncLoc);

								}.bind(this),
								error: function(oData, oResponse) {
									if (oData.statusCode === "404") {
										this.searchFuncLocWithId(scannedEquipmentId);
									} else {
										this.errorCallBackShowInPopUp();
									}
								}.bind(this)
							};
							this.getView().getModel().read("/EquipmentsSet('" + scannedEquipmentId + "')", onDataReceived);
						}

					}.bind(this));

			} else {
				this.showAlertNotDevice();
			}

		},
		searchFuncLocWithId: function(equipId) {
			var onDataReceived = {
				success: function(oData, oResponse) {
					var equipmentNo = oData.FunctionalLocation;
					var isFuncLoc = true;
					this.ShowEquipmentDetailsWithId(equipmentNo, isFuncLoc);
				}.bind(this),
				error: function(oData, oResponse) {
					if (oData.statusCode === "404") {
						this.showAlertNoObjectFound(equipId);

					} else {
						this.errorCallBackShowInPopUp();
					}
				}.bind(this)
			};

			this.getView().getModel().read("/FunctionalLocationsSet('" + equipId + "')", onDataReceived);
		},

		ShowEquipmentDetailsWithId: function(equipmentId, isFuncLoc) {

			if (!isFuncLoc) {
				var objectContext = "/EquipmentsSet('" + equipmentId + "')";

				this.getRouter().navTo("equipmentDetails", {
					objectContext: objectContext.substring(1)

				}, false);
			} else {
				var objectContext = "/FunctionalLocationsSet('" + equipmentId + "')";
				this.getRouter().navTo("functionalLocationDetails", {
					objectContext: objectContext.substring(1)

				}, false);

			}

		},
		showAlertNoObjectFound: function(equipmentNo) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(this.getI18nTextReplace1("Dashboard-scanObjectTile-searchObjectNotFoundMsgText", equipmentNo), {
				icon: MessageBox.Icon.NONE,
				title: this.getI18nText("Dashboard-scanObjectTile-searchObjectNotFoundMsgTitleText"),
				actions: [MessageBox.Action.OK],
				defaultAction: MessageBox.Action.OK,
				styleClass: bCompact ? "sapUiSizeCompact" : ""
			});
		},

		showAlertNotDevice: function() {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(this.getI18nText("Dashboard-scanObjectTile-isNotDeviceMsgText"), {
				icon: MessageBox.Icon.NONE,
				title: this.getI18nText("Dashboard-scanObjectTile-isNotDeviceMsgTitleText"),
				actions: [MessageBox.Action.OK],
				defaultAction: MessageBox.Action.OK,
				styleClass: bCompact ? "sapUiSizeCompact" : ""
			});

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
				//Reset create notification model
				var selectObjectForNewNotificationModel = this.getView().getModel("selectObjectForNewNotificationModel");
				selectObjectForNewNotificationModel.setData({});

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
			this.settingsDialog.setModel(this.getView().getModel("device"), "device");
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

		onPressFunctionalLocations: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				//var oRouter = this.getRouter();
				oRouter.navTo("structureBrowser", true);
			}
		},
		performNavigationForBlocks: function(a, b, data) {

			if ('operation'.localeCompare(data.block) === 0) {
				this.getRouter().navTo("operationDetails", {
					operationContext: data.operationContext
				}, false);
			} else if ('equipment'.localeCompare(data.block) === 0) {
				this.getRouter().navTo("equipmentDetails", {
					objectContext: data.objectContext
				}, false);
			} else if ("measurement".localeCompare(data.block) === 0) {
				this.getRouter().navTo("measurementPointDetails", {
					measurementContext: data.measurementContext
				}, false);
			} else if ('functionalLocation'.localeCompare(data.block) === 0) {
				this.getRouter().navTo("functionalLocationDetails", {
					objectContext: data.objectContext
				}, false);
			}
		},

		getDashBoardLogo: function() {
			return jQuery.sap.getModulePath("com.twobm.mobileworkorder") + "/images/DashboardLogo.png";
		},

		getLanguageFlag: function(uiLanguageCode) {
			switch (uiLanguageCode) {
				case "cs":
				case "cs-CZ":
					return "images/flags/cz.png";
				case "da":
				case "da-DK":
					return "images/flags/da.png";
				case "de":
				case "de-DE":
					return "images/flags/de.png";
				case "en":
				case "en-UK":
					return "images/flags/uk.png";
				case "en-US":
					return "images/flags/us.png";
				case "es":
				case "es-MX":
					return "images/flags/es.png";
				case "hu":
				case "hu-HU":
					return "images/flags/hu.png";
				case "no":
				case "nn-NO":
					return "images/flags/no.png";
				case "sv":
				case "sv-SE":
					return "images/flags/se.png";
				case "zh": //Chinese simplified
					return "images/flags/zh.png";
				default:
					return "";
			}
		},

		changeLanguage: function() {
			// Create value help dialog if we dont have one
			if (!this.changeLanguageDialog) {
				this.changeLanguageDialog = sap.ui.xmlfragment(this.createId("ChangeLanguageDialog"),
					"com.twobm.mobileworkorder.components.dashboard.fragments.LanguageSelect",
					this
				);
				// Attach to view
				this.getView().addDependent(this.changeLanguageDialog);
			}
			// Bind to parent code group so we show the correct codes
			//this.changeLanguageDialog.bindElement(this.codeGroupBindingContext);
			// Show dialog
			this.changeLanguageDialog.open();
		},

		handleLanguageChanged: function(oEvent) {
			// Get selected item
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {

				var langCode = selectedItem.getBindingContext("languagesModel").getObject().LanguageCode;

				sap.ui.getCore().getConfiguration().setLanguage(langCode);

				// Update values on model
				this.getView().getModel("appInfoModel").setProperty("/UILanguage", langCode);

				//Show Browser and configuration language
				sap.m.MessageToast.show(
					"Browser language: " + window.navigator.language + "\n" +
					"Core config language: " + sap.ui.getCore().getConfiguration().getLanguage() + "\n" +
					"Format locale: " + sap.ui.getCore().getConfiguration().getFormatLocale() + "\n" +
					"SAP Logon language: " + sap.ui.getCore().getConfiguration().getSAPLogonLanguage()
				);
			}
		}

	});
});