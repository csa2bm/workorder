sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller, Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.MeasuringPointsBlock", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */

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
			currentObject.RecordedValue = null;
			this._oPopover.getModel("ViewModel").setData(currentObject);
			this._oPopover.getModel("ViewModel").refresh();                         
			
			this._oPopover.open();
		},
		closeAddMeasurement: function() {
			this._oPopover.close();
		},
		
		onSubmitMeasurement : function()
		{
			var that = this;
			
			var parameters = {
				success: function(oData, response) {
					that.getView().byId("idMeasuringPointTable").getBinding("items").refresh();
					that.closeAddMeasurement();
				},
				error: that.errorCallBackShowInPopUp
			};

			var viewModel = this._oPopover.getModel("ViewModel").getData();

			var dataCreate = {
				Measpoint : viewModel.Measpoint,
			    ReadingDate: new Date(),
			//	ReadingTime: new Date(),
				RecordedValue : viewModel.RecordedValue
			};

			var createPath = "/MeasurementDocsSet";

			this.getView().getModel().create(createPath, dataCreate, parameters);	
		},

		isOrderStatusNotCompleted: function(OrderStatus) {
			if (OrderStatus === this.getI18nText("orderStatusCompleted")) {
				return false;
			} else {
				return true;
			}
		},
		orderStatusValid: function(str){
			
			var oContext = this.getView().getBindingContext();
			var model = this.getView().getModel();
			
			return !this.readOnly(oContext, model);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onExit: function() {
		//
		//	}

	});

});