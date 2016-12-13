sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.blocks.OperationsBlock", {
		onInit: function() {
		},

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

			this.operationPath = oEvent.getSource().getBindingContext().getPath();

			var that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (operationStatus) {

				sap.m.MessageBox.show(this.getI18nText("WorkOrderDetails-OperationBlock-CancelCompletionAlertMsg"), {
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

		opStatusColor: function(sStatus) {
			if (sStatus) {
				return "Default";
			} else {
				return "Default";
			}
		},
		
		opStatusIcon: function(sStatus) {
			if (sStatus) {
				return "sap-icon://circle-task-2"; 
			} else {
				return "sap-icon://circle-task";
			}
		},
		
		orderStatusValid: function(str){
			var oContext = this.getView().getBindingContext();
			var model = this.getView().getModel();
			
			return !this.readOnly(oContext, model);
		}
	});
});