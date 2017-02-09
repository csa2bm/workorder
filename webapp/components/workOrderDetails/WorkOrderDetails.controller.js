sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	'sap/m/MessageBox'
], function(Controller, History, MessageBox) {
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
					function(oEvent2) {
						//var f = oEvent2;
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
				message = this.getI18nText("WorkOrderDetails-orderStatusMessageNotStarted");
			} else if (orderStatus === this.getI18nText("orderStatusInProgress")) {
				message = this.getI18nText("WorkOrderDetails-orderStatusMessageInProgress");
			}

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var that = this;
			sap.m.MessageBox.show(message, {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("WorkOrderDetails-orderStatusTitle"),
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

					if (orderStatus === that.getI18nText("orderStatusCompleted")) {
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
			var btnText = this.getI18nText("WorkOrderDetails-orderStatusBtnTextNotStarted");
			if (sString === this.getI18nText("orderStatusNotStarted")) {
				btnText = this.getI18nText("WorkOrderDetails-orderStatusBtnTextNotStarted");
			} else if (sString === this.getI18nText("orderStatusInProgress")) {
				btnText = this.getI18nText("WorkOrderDetails-orderStatusBtnTextInProgress");
			} else {
				btnText = this.getI18nText("WorkOrderDetails-orderStatusBtnTextCompleted");
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
					objectContext: data.objectContext
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
		},

		isInErrorStateWorkOrder: function(errorsArray, orderId) {
			if ($.inArray(orderId, errorsArray) >= 0) {
				return true;
			} else {
				return false;
			}
		},

		openErrorsView: function(oEvent) {
			var orderId = oEvent.getSource().getBindingContext().getObject().Orderid;

			this.getView().getModel("syncStatusModel").getData().ErrorListContextObject = "Order";
			this.getView().getModel("syncStatusModel").getData().ErrorListContextID = orderId;
			this.getView().getModel("syncStatusModel").refresh();

			if (!this._errorsView) {

				var idPrefix = this.getView().createId("errorList");
				var controller = sap.ui.controller("com.twobm.mobileworkorder.components.offline.ErrorListControl");
				this._errorsView = sap.ui.xmlfragment(idPrefix,
					"com.twobm.mobileworkorder.components.offline.fragments.ErrorsListPopover", controller);
				this._errorsView.setModel(this.getView().getModel());
				controller.dialog = this._errorsView;
				controller.idPrefix = idPrefix;
				this.getView().addDependent(this._errorsView);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			// var oButton = oEvent.getSource();
			// jQuery.sap.delayedCall(0, this, function() {
			this._errorsView.open();

		},

		onOrderReAssignToUserButtonPressed: function(oEvent) {
			if (!this._reAssignPopover) {
				this._reAssignPopover = sap.ui.xmlfragment("ReAssignPopover",
					"com.twobm.mobileworkorder.components.workOrderDetails.fragments.ReAssignPopover",
					this);

				this._reAssignPopover.setModel(this.readingModel, "ViewModel");

				//this._oPopover.attachAfterOpen(this.resizePopup);

				this._reAssignPopover.attachBeforeClose(function() {
					//Just make sure that the control minimized
					//sap.ui.getCore().byId("popupImageControl").setWidth(null);
				});

				this.getView().addDependent(this._reAssignPopover);
			}

			this._reAssignPopover.open();
		},

		onReAssignOKButtonPressed: function() {
			var list = sap.ui.core.Fragment.byId("ReAssignPopover", "reAssignEmployeeList");

			if (list.getSelectedContextPaths().length < 1) {
				MessageBox.alert(
					"Please select a user in the list.");
				return;
			}

			var pernr = this.getView().getModel().getData(list.getSelectedContextPaths()[0]).Persno;

			this.assignOrderToPersonelNumber(pernr);

			this._reAssignPopover.close();
		},

		closeReAssignPopover: function() {
			this._reAssignPopover.close();
		},

		onOrderReAssignToMePressed: function() {
			sap.m.MessageBox.show("Assign the work order to you?", {
				icon: sap.m.MessageBox.Icon.None,
				title: "Re-assign work order",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				onClose: function(oAction, object) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						this.assignOrderToPersonelNumber(this.getView().getModel("appInfoModel").getData().Persno);
					} else {
						return;
					}
				}.bind(this)
			});
		},

		onOrderReAssignUnassignPressed: function() {
			sap.m.MessageBox.show("Unassign youself from the work order?", {
				icon: sap.m.MessageBox.Icon.None,
				title: "Re-assign work order",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				defaultAction: sap.m.MessageBox.Action.NO,
				onClose: function(oAction, object) {

					if (oAction === sap.m.MessageBox.Action.YES) {
						this.assignOrderToPersonelNumber("");
					} else {
						return;
					}

				}.bind(this)

			});
		},

		assignOrderToPersonelNumber: function(personelNumber) {
			this.getView().getModel().update(this.getView().getBindingContext().getPath(), {
				Personresp: personelNumber
			}, {
				success: function(oData, response) {
					this.navigateBack();
				}.bind(this),
				error: this.errorCallBackShowInPopUp
			});
		},

		onOrderReAssignButtonPressed: function(oEvent) {
			var oButton = oEvent.getSource();

			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"com.twobm.mobileworkorder.components.workOrderDetails.fragments.ReAssignActionSheet",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}

			this._actionSheet.openBy(oButton);
		},

		allowAssignToMe: function(personelNumber) {
			if (this.getView().getModel("appInfoModel").getData().Persno === personelNumber)
				return false;

			return true;
		},

		allowUnassign: function(personelNumber) {
			if (this.getView().getModel("appInfoModel").getData().Persno === personelNumber)
				return true;

			return false;
		},

		searchEmployeePress: function(oEvent) {
			var sValue = oEvent.getParameter("query");
			var searchString = sValue.toLowerCase();

			this.searchEmployee(searchString);
		},

		searchEmployeeLive: function(oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var searchString = sValue.toLowerCase();

			this.searchEmployee(searchString);
		},

		searchEmployee: function(sValue) {
			var aFilters = [];
			var searchString = sValue.toLowerCase();

			aFilters.push(new sap.ui.model.Filter("Searchstring", sap.ui.model.FilterOperator.Contains, searchString));

			// update list binding
			var list = sap.ui.core.Fragment.byId("ReAssignPopover", "reAssignEmployeeList");
			var itemsBinding = list.getBinding("items");

			if (itemsBinding) {
				itemsBinding.aApplicationFilters = [];

				if (aFilters.length > 0) {

					var filter = new sap.ui.model.Filter({
						filters: aFilters,
						and: true
					});

					itemsBinding.filter(filter);
				} else {
					itemsBinding.filter(aFilters);
				}
			}
		},

		onTimeRegistrationTimerChangeButtonPressed: function(oEvent) {
			var timerModel = this.getView().getModel("timeRegistrationTimerModel").getData();

			var currentOrderId = this.getView().getBindingContext().getObject().Orderid;

			//Timer has not been set or timer is 
			if (timerModel.OrderId && timerModel.OrderId !== "" && timerModel.OrderId === currentOrderId) {
				//Stop the timer

				//Find the elapsed time
				var endTime = new Date();
				var startTime = new Date(this.getView().getModel("timeRegistrationTimerModel").getData().StartDateTime);

				var difference = endTime - startTime; //in milliseconds

				var differenceInHours = difference / 1000 / 60 / 60;

				var that = this;
				sap.m.MessageBox.show(this.getI18nTextReplace1("WorkOrderDetails-StopWorkPopupMessage", currentOrderId), {
					icon: sap.m.MessageBox.Icon.None,
					title: this.getI18nText("WorkOrderDetails-StopWorkPopupHeader"),
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					defaultAction: sap.m.MessageBox.Action.NO,
					onClose: function(oAction, object) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							var data = {
								"Hours": differenceInHours
							};

							var eventBus = that.getEventBus();
							eventBus.publish("TimeRegistrationTimerStopped", data);

							that.getView().getModel("timeRegistrationTimerModel").getData().Started = false;
							that.getView().getModel("timeRegistrationTimerModel").getData().OrderId = "";
							that.getView().getModel("timeRegistrationTimerModel").getData().StartDateTime = "";
							that.getView().getModel("timeRegistrationTimerModel").refresh();
						}
					}
				});

			} else if (timerModel.OrderId && timerModel.OrderId !== "" && timerModel.OrderId !== currentOrderId) {
				//Timer is already running for another order - show warning
				sap.m.MessageToast.show(this.getI18nTextReplace1("WorkOrderDetails-StartWorkWarningTimerAlreadyRunning", timerModel.OrderId));
			} else {
				//Start timer for current order
				this.getView().getModel("timeRegistrationTimerModel").getData().Started = true;
				this.getView().getModel("timeRegistrationTimerModel").getData().OrderId = currentOrderId;
				this.getView().getModel("timeRegistrationTimerModel").getData().StartDateTime = new Date().toString();
				this.getView().getModel("timeRegistrationTimerModel").refresh();

				//TODO post userstatus change 

				sap.m.MessageToast.show(this.getI18nText("WorkOrderDetails-StartWorkMessageToastText"));
			}
		},

		determineTimeRegistrationTimerButtonType: function(orderId, timerStarted) {
			var timerModel = this.getView().getModel("timeRegistrationTimerModel").getData();

			if (timerModel.OrderId !== "" & timerModel.OrderId === orderId) {
				if (timerStarted) {
					return "Accept";
				} else {
					return "Emphasized";
				}
			} else {
				return "Emphasized";
			}
		},

		determineTimeRegistrationTimerButtonText: function(orderId, timerStarted) {
			var timerModel = this.getView().getModel("timeRegistrationTimerModel").getData();

			if (timerModel.OrderId !== "" & timerModel.OrderId === orderId) {
				if (timerStarted) {
					return this.getI18nText("WorkOrderDetails-TimeRegistrationTimerButtonTextStopWork");
				} else {
					return this.getI18nText("WorkOrderDetails-TimeRegistrationTimerButtonTextStartWork");
				}
			} else {
				return this.getI18nText("WorkOrderDetails-TimeRegistrationTimerButtonTextStartWork");
			}
		}
	});
});