sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller,Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.equipmentDetails.MeasuringPointsBlock", {
		formatter:Formatter,
		
		onInit: function() {
				
				// Databind to measuring points from object
			
				
				this.readingModel = new sap.ui.model.json.JSONModel();
				this.createAttachmentViewerPopover();
			},
		
			createAttachmentViewerPopover: function() {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderDetails.fragments.CreateMeasurementPopover",
					this);

				this._oPopover.setModel(this.readingModel, "ViewModel");

				//this._oPopover.attachAfterOpen(this.resizePopup);

				this._oPopover.attachBeforeClose(function() {
					//Just make sure that the control minimized
					//sap.ui.getCore().byId("popupImageControl").setWidth(null);
				});

				this.getView().addDependent(this._oPopover);
			}
		},
		addMeasurement: function(oEvent) {
			var currentObject = oEvent.getSource().getBindingContext().getObject();
			
			
			
			this._oPopover.getModel("ViewModel").setData(currentObject);
			this._oPopover.getModel("ViewModel").refresh();                         
			
			this._oPopover.open();
		},
		closeAddMeasurement: function() {
			this._oPopover.close();
		}

	});

});