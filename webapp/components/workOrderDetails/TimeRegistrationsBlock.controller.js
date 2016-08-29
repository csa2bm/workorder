sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller, Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.TimeRegistrationsBlock", {

		onInit: function() {
			this.createAddTimeRegistrationPopover();
		},

		createAddTimeRegistrationPopover: function() {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("AddTimeRegistration",
					"com.twobm.mobileworkorder.components.workOrderDetails.fragments.AddTimeRegistrationPopover", this);
				this._oPopover.attachBeforeClose(function() {
			});

				this.getView().addDependent(this._oPopover);
			}
		},

		openAddTimeRegistrationPopover: function() {
			var orderNumber = this.getView().getBindingContext().getObject().Orderid;	
			var oTimeModel = {WorkTime:"", RegistrationDate:new Date(), Orderid:orderNumber};
			this._oPopover.setModel(new sap.ui.model.json.JSONModel(oTimeModel));
			this._oPopover.open();
		},

		closeAddTimeRegistrationPopover: function() {
				if (this._oPopover) {
				this._oPopover.close();
			}
		},
		postTimeRegistration: function(){
			var oTimeData = this._oPopover.getModel().getData();
			//Fix Problem with post 00:00:00 as time on date
			oTimeData.RegistrationDate.setHours(15);
			var oModel= this.getView().getModel();	
			var successCallBack = 
				(function(){
					this.closeAddTimeRegistrationPopover();
				}).bind(this);
			
			
			oModel.create("/TimeRegistrationsSet", oTimeData, {success:successCallBack,error:this.errorCallBackShowInPopUp});
	
		}
	});

});