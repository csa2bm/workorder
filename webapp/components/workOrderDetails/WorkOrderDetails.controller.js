sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.WorkOrderDetails", {
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("workOrderDetails").attachMatched(this.onRouteMatched, this);

			//Subscribe to events
			var eventBus = this.getEventBus();
			eventBus.subscribe("BlockNavigation", this.performNavigationForBlocks, this);

			this.createEditModeModel();
		},

		createEditModeModel: function() {
			var editModeModel = this.getView().getModel("EditModeModel");

			if (!editModeModel) {
				editModeModel = new sap.ui.model.json.JSONModel();
				editModeModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
				this.getView().setModel(editModeModel, "EditModeModel");
			}

			this.clearEditModeModel();
		},

		clearEditModeModel: function() {
			var editModeModel = this.getView().getModel("EditModeModel");

			var data = {
				EditMode: false
			};

			editModeModel.setData(data);
		},

		onRouteMatched: function(oEvent) {
			//Are we navigating to this view??
			//if not do nothing
			var oArguments = oEvent.getParameter("arguments");
			var contextPath = '/' + oArguments.workOrderContext;
			var givenContext = new sap.ui.model.Context(this.getView().getModel(), contextPath);

			//this.oContext is the current context of the view
			//this context is the context that was set when the view was shown the last time
			//therefore the new contextPath can be different from the contextPath/context
			//that was shown the last time the view was shown
			if (!this.getView().getBindingContext() || this.getView().getBindingContext().getPath() !== contextPath) {
				//Reset model to the new context
				this.ExpandLoaded = false;
				//this.oContext = givenContext;
				this.getView().setBindingContext(givenContext);
				this.getView().bindElement(contextPath);

				if (!this.getView().getBindingContext()) {
					this.scrollToTop();
				}
			}

			//do we have this context loaded in our model? We should always have a timeregistration entry
			if (this.ExpandLoaded) { //this.getView().getBindingContext().getObject()) {

				//if yes, refresh the model to reflect in memory model any changes done remotely to the order
				this.getView().getBindingContext().getModel().refresh(); //using true as argument got strange errors to arise

				//Set edit mode
				this.updateEditModeModel(this.getView().getBindingContext().getObject().OrderStatus);

			} else {
				var that = this;
				//if not, create the binding context with all the expands we need in this view
				var aExpand = ["OrderOperation", "OrderComponent", "OrderObject", "OrderAttachments", "OrderGoodsMovements"];

				this.getView().getModel().createBindingContext(contextPath, "", {
						expand: aExpand.toString()
					},
					function(oEvent) {
						var f = oEvent;
						that.ExpandLoaded = true;

						//Set edit mode
						var orderStatus = that.getView().getBindingContext().getObject().OrderStatus;
						that.updateEditModeModel(orderStatus);

					}, true);
			}

			var eventBus = sap.ui.getCore().getEventBus();
			var data = {
				noteLongTextField: ""

			};
			eventBus.publish("longTextDisplayMode", data);
		},

		navigateBack: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("workOrderList", true);
			}

			this.scrollToTop();
		},

		orderStatusBtnPressed: function(oEvent) {
			//var oButton = oEvent.getSource();
			var oContext = this.getView().getBindingContext();
			var OrderStatus = this.getView().getModel().getProperty("OrderStatus", oContext);
			this.setUserStatusTaskStarted(OrderStatus);
		},

		setUserStatusTaskStarted: function(orderStatus) {
			var message = "";
			if (orderStatus === this.getI18nText("orderStatusNotStarted")) {
				message = this.getI18nText("orderStatusMessageNotStarted");
			} else if (orderStatus === this.getI18nText("orderStatusInProgress")) {
				message = this.getI18nText("orderStatusMessageInProgress");
			}

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var that = this;
			sap.m.MessageBox.show(message, {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("orderStatusTitle"),
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						// Set the order status to "inProgress" and post it
						var newStatus = "";
						if (orderStatus === that.getI18nText("orderStatusNotStarted")) {
							newStatus = that.getI18nText("orderStatusInProgress");
						}
						// Set the order status to "completed" and post it
						else if (orderStatus === that.getI18nText("orderStatusInProgress")) {
							newStatus = that.getI18nText("orderStatusCompleted");
						} else {
							return;
						}

						var oContext = that.getView().getBindingContext();
						that.getView().getModel().setProperty("OrderStatus", newStatus, oContext);
						that.updateOrderStatus();
					}
				}
			});
		},
		
		updateOrderStatus: function() {
			var orderNo = this.getView().getBindingContext().getObject().Orderid;
			var that = this;

			var parameters = {
				success: function(oData, response) {
					var orderStatus = that.getView().getBindingContext().getObject().OrderStatus;

					that.updateEditModeModel(orderStatus);

					if (orderStatus == that.getI18nText("orderStatusCompleted")) {
						that.navigateBack();
					}
				},
				error: that.errorCallBackShowInPopUp
			};

			var dataUpdate = {
				OrderStatus: this.getView().getBindingContext().getObject().OrderStatus
			};

			var updatePath = "/OrderSet(Orderid='" + orderNo + "')";

			this.getView().getModel().update(updatePath, dataUpdate, parameters);
		},

		updateEditModeModel: function(orderStatus) {
			var orderStatusBool = false;
			if (orderStatus === this.getI18nText("orderStatusCompleted") || orderStatus === this.getI18nText("orderStatusNotStarted")) {
				orderStatusBool = false;
			} else {
				orderStatusBool = true;
			}

			var editModeModel = this.getView().getModel("EditModeModel");
			editModeModel.getData().EditMode = orderStatusBool;
			editModeModel.refresh();
		},

		getOrderStatusBtnText: function(sString) {
			var btnText = this.getI18nText("orderStatusBtnTextNotStarted");
			if (sString === this.getI18nText("orderStatusNotStarted")) {
				btnText = this.getI18nText("orderStatusBtnTextNotStarted");
			} else if (sString === this.getI18nText("orderStatusInProgress")) {
				btnText = this.getI18nText("orderStatusBtnTextInProgress");
			}
			else {
				btnText = this.getI18nText("orderStatusBtnTextCompleted");
			}
			return btnText;
		},

		isOrderNotCompleted: function(sString) {
			if (sString === this.getI18nText("orderStatusCompleted")) {
				return false;
			} else {
				return true;
			}
		},

		isOrderNotCompletedType: function(sString) {
			if (sString === this.getI18nText("orderStatusNotStarted")) {
				return "Emphasized";
			} else {
				return "Accept";
			}
		},

		performNavigationForBlocks: function(a, b, data) {

			if ('operation'.localeCompare(data.block) === 0) {
				this.getRouter().navTo("operationDetails", {
					operationContext: data.operationContext
				}, false);
			} else if ('equipment'.localeCompare(data.block) === 0) {
				this.getRouter().navTo("equipmentDetails", {
					equipmentContext: data.equipmentContext
				}, false);
			} else if ("measurement".localeCompare(data.block) === 0) {
				this.getRouter().navTo("measurementPointDetails", {
					measurementContext: data.measurementContext
				}, false);
			}
		},

		scrollToTop: function() {
			var generalSection = this.getView().byId("generalSubSection").getId();
			if (generalSection) {
				this.getView().byId("ObjectPageLayout").scrollToSection(generalSection, 0, -500);
			}
		}
	});
});