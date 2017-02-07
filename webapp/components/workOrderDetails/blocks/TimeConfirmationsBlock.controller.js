sap.ui.define([	"com/twobm/mobileworkorder/util/Controller",	"com/twobm/mobileworkorder/util/Formatter",	"sap/ui/model/SimpleType",	"sap/ui/model/ValidateException",	"sap/m/MessageToast"], function(Controller, Formatter, SimpleType, ValidateException, MessageToast) {	"use strict";	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.blocks.TimeConfirmationsBlock", {		onInit: function() {			this.createTimeConfirmationPopover();			//Subscribe to events			var eventBus = this.getEventBus();			eventBus.subscribe("TimeRegistrationTimerStopped", this.CreateTimeRegistrationFromTimer, this);		},		createTimeConfirmationPopover: function() {			if (!this._oPopover) {				this._oPopover = sap.ui.xmlfragment("TimeConfirmationPopover",					"com.twobm.mobileworkorder.components.workOrderDetails.fragments.TimeConfirmationPopover", this);				this.getView().addDependent(this._oPopover);				//This should happen when the 				// this._oPopover.attachBeforeClose(function(oEvent) {				// 	var that = this;				// 	this.closeAddTimeRegistrationPopover(oEvent);				// });				//Create Event Handling for timeTypeErrors				this._oPopover.attachValidationError(function(evt) {					var control = evt.getParameter("element");					if (control && control.setValueState) {						control.setValueState("Error");					}					var errorMessage = evt.getParameter("message");					MessageToast.show(errorMessage);				});				this._oPopover.attachValidationSuccess(function(evt) {					var control = evt.getParameter("element");					if (control && control.setValueState) {						control.setValueState("None");					}				});			}		},		CreateTimeRegistrationFromTimer: function(a, b, data) {			var oTimeModel = {				ActWork: data.Minutes, //Work Time				ExecStartDate: new Date(), //Start date				Path: this.getView().getBindingContext().getPath() + "/ConfirmationsSet",				type: "create"			};						var createModel = new sap.ui.model.json.JSONModel(oTimeModel);			this.openTimeConfirmationPopover(createModel);		},		createNewTimeRegistration: function(oEvent) {			var oTimeModel = {				ActWork: "", //Work Time				ExecStartDate: new Date(), //Start date				Path: this.getView().getBindingContext().getPath() + "/ConfirmationsSet",				type: "create"			};						var createModel = new sap.ui.model.json.JSONModel(oTimeModel);						this.openTimeConfirmationPopover(createModel);		},		updateTimeRegistration: function(oEvent) {			var timeConf = oEvent.getSource().getBindingContext().getObject();			var oTimeModel = {				ActWork: timeConf.ActWork, //Work Time				ExecStartDate: new Date(timeConf.ExecStartDate), // Start date				Path: oEvent.getSource().getBindingContext().getPath(),				type: "update"			};			var updateModel = new sap.ui.model.json.JSONModel(oTimeModel);						this.openTimeConfirmationPopover(updateModel);		},		openTimeConfirmationPopover: function(oTimeModel) {			this._oPopover.setModel(oTimeModel);			//Reset value state on the work time text field			sap.ui.core.Fragment.byId("TimeConfirmationPopover", "WorkTimeConfirmationField").setValueState("None");			this._oPopover.open();		},		closeAddTimeRegistrationPopover: function(oEvent) {			// var sPathArr = [];			// var sPath = oEvent.getSource().getBindingContext().getPath();			// sPathArr.push(sPath);			// this.getView().getModel().resetChanges(sPathArr);			if (this._oPopover) {				this._oPopover.close();			}		},		deleteTimeRegistration: function(oEvent) {			var that = this;			//var sbindingContextPath = oEvent.getSource().getBindingContext().getPath();			var deletePath = this._oPopover.getModel().getData().Path;			this.getView().getModel().remove(deletePath, {				success: function() {					that.closeAddTimeConfirmationPopover();					that.getView().byId("TimeConfirmationsList").getBinding("items").refresh(true);				},				error: this.errorCallBackShowInPopUp			});		},		postTimeRegistration: function(oEvent) {			var workTimeField = sap.ui.core.Fragment.byId("TimeConfirmationPopover", "WorkTimeConfirmationField");			var oTimeData = this._oPopover.getModel().getData();			var that = this;			//Parameters for Posts			var parameters = {				success: function(oData, response) {					that.closeAddTimeRegistrationPopover();					that.getView().byId("TimeConfirmationsList").getBinding("items").refresh(true);				},				error: this.errorCallBackShowInPopUp			};			//Check to see if time entry validated properly			if (workTimeField.getValueState() !== "Error") {				//Check to see if the time registration is create or update				if (oEvent.getSource().getModel().getProperty("/type") === "update") {					var oData = {						WorkTime: oTimeData.WorkTime,						RegistrationDate: oTimeData.RegistrationDate					};					this.getView().getModel().update(oTimeData.Path, oData, parameters);				} else {					//This is handling of Create					var oTimeData = this._oPopover.getModel().getData();					//Create Post object					var oData = {						RegistrationDate: oTimeData.RegistrationDate,						Name: this.getView().getModel("appInfoModel").getData().UserFullName					};					this.getView().getModel().create(oTimeData.Path, oData, parameters);				}			}		},		typeTimeFormat: SimpleType.extend("typeTimeFormat", {			formatValue: function(oValue) {				return oValue;			},			parseValue: function(oValue) {				//parsing step takes place before validating step, value can be altered				return oValue;			},			validateValue: function(oValue) {				var timeTypeRegex = /^[0-9.,]+$/;				// /(^\d{1,2}$|^\d{1,2},\d{1,2}$)/;				if (!oValue.match(timeTypeRegex)) {					throw new ValidateException("'" + oValue + "' is not a valid Time Entry");				}				if (oValue > 24) {					throw new ValidateException("'" + oValue + "' is not a valid Time Entry");				}				if (oValue < 0) {					throw new ValidateException("'" + oValue + "' is not a valid Time Entry");				}			}		}),		orderStatusValid: function(str) {			var orderStatus = this.getView().getModel().getProperty("OrderStatus", this.getView().getBindingContext());			if (orderStatus === this.getI18nText("orderStatusCompleted") || orderStatus === this.getI18nText("orderStatusNotStarted")) {				return true;			} else {				return false;			}		},		// Function that shows right arrow appear/disappear based on read-only rules		showArrow: function(persNoOnConf) {			var loggedInUserPersNo = this.getView().getModel("appInfoModel").getData().Persno;			if (persNoOnConf === loggedInUserPersNo) {				return "sap-icon://slim-arrow-right";			} else {				return "";			}		},		checkConfEditStatus: function(persNoOnConf) {			var orderStatus = this.getView().getModel().getProperty("OrderStatus", this.getView().getBindingContext());			var loggedInUserPersNo = this.getView().getModel("appInfoModel").getData().Persno;			if (persNoOnConf === loggedInUserPersNo) {				return "Active";			} else {				return "Inactive";			}		},		formatEDMTime: function(time) {			var that = this;			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({				pattern: "HH:mm" //"KK:mm:ss a"			});			// timezoneOffset is in hours convert to milliseconds			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs)); //			return timeStr;		},		isDeleteable: function(type) {			if (type === "update") {				return true;			} else {				return false;			}		}	});});