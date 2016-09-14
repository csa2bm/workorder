sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.OperationsBlock", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		onInit: function() {


		},

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

		gotoOperationDetailsPage: function(data) {

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("BlockNavigation", data);
		},

		onOperationItemPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			var data = {
				"block": "operation",
				"operationContext": oBindingContext.getPath().substr(1)
			};
			this.gotoOperationDetailsPage(data);
		},

		onCompleOperationbtnPressed: function(oEvent) {

			var operationStatus = oEvent.getSource().getBindingContext().getObject().Complete;
			//var oContext = this.getView().getBindingContext();
			
			this.operationPath = oEvent.getSource().getBindingContext().getPath();

			var that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (operationStatus) {

				sap.m.MessageBox.show(this.getI18nText("OperationBlockCancelCompletionAlertMsg"), {
					icon: sap.m.MessageBox.Icon.None,
					title: this.getI18nText("orderStatusTitle"),
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					defaultAction: sap.m.MessageBox.Action.NO,
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(oAction, object) {

						if (oAction === sap.m.MessageBox.Action.YES) {
							that.updateOperationStatus(that.operationPath, false);

						} else {
							return;
						}

					}

				});

			} else {
				this.updateOperationStatus(this.operationPath, true);
			}
		},

		updateOperationStatus: function(operationPath, complete) {
			var that = this;
			var parameters = {
				success: function(oData, response) {
					that.getView().byId("idOperationTable").getBinding("items").refresh();

				},
				error: that.errorCallBackShowInPopUp
			};

			var dataUpdate = {
				Complete: complete
			};

			this.getView().getModel().update(operationPath, dataUpdate, parameters);
		},

		/**
		 * Based on the value of operationstatus use different colors
		 * param{Boolean} sStatus input string
		 * @returns {String}} for SAP icon color
		 */
		opStatusColor: function(sStatus) {
			if (sStatus) {
				return "Accept";
			} else {
				return "Default";
			}
		},
		
		orderStatusValid: function(str){
			
			var oContext = this.getView().getBindingContext();
			var model = this.getView().getModel();
			
			return !this.readOnly(oContext, model);
		}
	});

});