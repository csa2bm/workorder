sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Formatter",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/m/MessageToast"
], function(Controller, Formatter,SimpleType, ValidateException, MessageToast) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.TimeRegistrationsBlock", {

		onInit: function() {
			this.createTimeRegistrationPopover();

		
		},

		createTimeRegistrationPopover: function() {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("TimeRegistrationPopover",
					"com.twobm.mobileworkorder.components.workOrderDetails.fragments.TimeRegistrationPopover", this);
				this._oPopover.attachBeforeClose(function() {
			});

				this.getView().addDependent(this._oPopover);

						//Create Event Handling for timeTypeErrors
			this._oPopover.attachValidationError(function (evt) {
				var control = evt.getParameter("element");
				if (control && control.setValueState) {
					control.setValueState("Error");
				}
				var errorMessage = evt.getParameter("message");
				MessageToast.show(errorMessage);
			});
			
					this._oPopover.attachValidationSuccess(function (evt) {
				var control = evt.getParameter("element");
				if (control && control.setValueState) {
					control.setValueState("None");
				}
			});

			}
		},

		openTimeRegistrationPopoverCreate: function(oEvent) {
		
				var orderNumber = this.getView().getBindingContext().getObject().Orderid;	
				var oTimeModel = {WorkTime:"", RegistrationDate:new Date(), Orderid:orderNumber, deletable:false,type:"create"};
				this._oPopover.setModel(new sap.ui.model.json.JSONModel(oTimeModel)).bindElement("/");
				sap.ui.core.Fragment.byId("TimeRegistrationPopover", "__WorkTimeField").setValueState("None");
				this._oPopover.open();
		
		
		},
		
		openTimeRegistrationPopoverUpdate: function(oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContextPath();
			var oTimeData= this.getView().getModel().getProperty(sBindingContext);
			
			this._oPopover.setModel(new sap.ui.model.json.JSONModel(oTimeData));
			this._oPopover.setModel(this.getView().getModel()).bindElement(sBindingContext);
			
			sap.ui.core.Fragment.byId("TimeRegistrationPopover", "__WorkTimeField").setValueState("None");
			
			this._oPopover.open();
		
		},
		
		

		closeAddTimeRegistrationPopover: function() {
				if (this._oPopover) {
				this.getView().getModel().refresh();	
				this._oPopover.close();
			}
		},
		deleteTimeRegistration: function(oEvent){
			var successCallBack = (function(){this.closeAddTimeRegistrationPopover();}).bind(this);
			var	sbindingContextPath = oEvent.getSource().getBindingContext().getPath();
			var oModel = oEvent.getSource().getModel();
			oModel.remove(sbindingContextPath,{success:successCallBack,error:this.errorCallBackShowInPopUp});
		},
		postTimeRegistration: function(oEvent){
			var workTimeField =	sap.ui.core.Fragment.byId("TimeRegistrationPopover", "__WorkTimeField");
			
		
			//Check to see if time entry validated properly
			if (workTimeField.getValueState()!=="Error") {
				
			var successCallBack = (function(){this.closeAddTimeRegistrationPopover();}).bind(this);
			//Check to see if the time registration is create or update
			if(oEvent.getSource().getModel().getProperty("/deletable")===undefined){
				oEvent.getSource().getModel().submitChanges({success:successCallBack,error:this.errorCallBackShowInPopUp});
			}
			else{
			var oTimeData = this._oPopover.getModel().getData();
			//Fix Problem with post 00:00:00 as time on date
		    var registrationDate =	new Date(oTimeData.RegistrationDate.setHours(15));
			
			//Create Post object
			var oTimeDataPost = JSON.parse(JSON.stringify(oTimeData));
			delete oTimeDataPost["deletable"];
			delete oTimeDataPost["type"];
			//use date instead of string.
			oTimeDataPost.RegistrationDate= registrationDate;
			var oModel= this.getView().getModel();	
			oModel.create("/TimeRegistrationsSet", oTimeDataPost, {success:successCallBack,error:this.errorCallBackShowInPopUp});
			}
			
			}
		},
		
				typeTimeFormat : SimpleType.extend("typeTimeFormat", {
			formatValue: function (oValue) {
				return oValue;
			},
			parseValue: function (oValue) {
				//parsing step takes place before validating step, value can be altered
				return oValue;
			},
			validateValue: function (oValue) {
				var timeTypeRegex = /(^\d{1,2}$|^\d{1,2},\d{1,2}$)/;
				if (!oValue.match(timeTypeRegex)) {
					throw new ValidateException("'" + oValue + "' is not a valid Time Entry");
				}
			}
		}),
		orderStatusValid: function(str){
			
			var oContext = this.getView().getBindingContext();
			var model = this.getView().getModel();
			
			return !this.readOnly(oContext, model);
		}

 
		
	});

});