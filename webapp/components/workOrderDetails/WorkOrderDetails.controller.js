sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	'sap/m/MessageBox'
], function(Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.WorkOrderDetails", {
		onInit: function() {
			this.getRouter().getRoute("workOrderDetails").attachMatched(this.onRouteMatched, this);

			//Subscribe to events
			this.getEventBus().subscribe("BlockNavigation", this.performNavigationForBlocks, this);

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

			// //do we have this context loaded in our model? We should always have a timeregistration entry
			// if (this.ExpandLoaded) { //this.getView().getBindingContext().getObject()) {

			// 	//if yes, refresh the model to reflect in memory model any changes done remotely to the order
			// 	this.getView().getBindingContext().getModel().refresh(); //using true as argument got strange errors to arise

			//Set edit mode
			if (this.getView().getBindingContext().getObject()) {
				this.updateEditModeModel(this.getView().getBindingContext().getObject().OrderStatus);
			}

			// } else {
			// 	var that = this;
			// 	//if not, create the binding context with all the expands we need in this view
			// 	var aExpand = ["OrderOperation", "OrderComponent", "OrderObject", "OrderAttachments", "OrderGoodsMovements"];

			// 	this.getView().getModel().createBindingContext(contextPath, "", {
			// 			expand: aExpand.toString()
			// 		},
			// 		function(oEvent2) {
			// 			//var f = oEvent2;
			// 			that.ExpandLoaded = true;

			// 			//Set edit mode
			// 			var orderStatus = that.getView().getBindingContext().getObject().OrderStatus;
			// 			that.updateEditModeModel(orderStatus);

			// 		}, true);
			// }

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
			if (orderStatus === "INITIAL") {
				message = this.getI18nText("WorkOrderDetails-orderStatusMessageNotStarted");
			} else if (orderStatus === "INPROGRESS") {

				if (this.timerIsRunningForOrder("completeorder")) {
					return;
				}
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
						if (orderStatus === "INITIAL") {
							newStatus = "INPROGRESS";
						}
						// Set the order status to "completed" and post it
						else if (orderStatus === "INPROGRESS") {
							newStatus = "COMPLETED";
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
			this.getView().setBusy(true);
			this.getView().getModel().update(this.getView().getBindingContext().getPath(), {
				OrderStatus: this.getView().getBindingContext().getObject().OrderStatus
			}, {
				success: function(oData, response) {
					var orderStatus = this.getView().getBindingContext().getObject().OrderStatus;

					this.updateEditModeModel(orderStatus);

					if (orderStatus === "COMPLETED") {
						this.navigateBack();
					}

					this.getView().setBusy(false);
				}.bind(this),
				error: function(oError) {
					this.errorCallBackShowInPopUp(oError);
					this.getView().setBusy(false);
				}.bind(this)
			});
		},

		updateEditModeModel: function(orderStatus) {
			var orderStatusBool = false;
			if (orderStatus === "COMPLETED" || orderStatus === "INITIAL") {
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
			if (sString === "INITIAL") {
				btnText = this.getI18nText("WorkOrderDetails-orderStatusBtnTextNotStarted");
			} else if (sString === "INPROGRESS") {
				btnText = this.getI18nText("WorkOrderDetails-orderStatusBtnTextInProgress");
			} else {
				btnText = this.getI18nText("WorkOrderDetails-orderStatusBtnTextCompleted");
			}
			return btnText;
		},

		isOrderNotCompleted: function(sString) {
			if (sString === "COMPLETED") {
				return false;
			} else {
				return true;
			}
		},

		isOrderNotCompletedType: function(sString) {
			if (sString === "INITIAL") {
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

		reAssignVisible: function(personelNumber) {
			if (this.getView().getModel("appInfoModel").getData().Persno === personelNumber)
				return true;

			return false;
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
				MessageBox.show(
					this.getI18nText("WorkOrderDetails-ReassignOrderSelectAUser"), {
						icon: MessageBox.Icon.INFORMATION,
						title: this.getI18nText("WorkOrderDetails-ReassignOrderSelectAUserHeader"),
						actions: [MessageBox.Action.OK]
					}
				);
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
			sap.m.MessageBox.show(this.getI18nText("WorkOrderDetails-ReassignOrderAssignToMePopupMessage"), {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("WorkOrderDetails-ReassignOrderPopupTitle"),
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
			sap.m.MessageBox.show(this.getI18nText("WorkOrderDetails-ReassignOrderUnassignPopupMessage"), {
				icon: sap.m.MessageBox.Icon.None,
				title: this.getI18nText("WorkOrderDetails-ReassignOrderPopupTitle"),
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
			this.getView().setBusy(true);
			this.getView().getModel().update(this.getView().getBindingContext().getPath(), {
				Personresp: personelNumber
			}, {
				success: function(oData, response) {
					this.navigateBack();
					this.getView().setBusy(false);
				}.bind(this),
				error: function(oError) {
					this.errorCallBackShowInPopUp(oError);
					this.getView().setBusy(false);
				}.bind(this)
			});
		},

		timerIsRunningForOrder: function(type) {
			var timeRegistrationTimerModel = this.getView().getModel("timeRegistrationTimerModel").getData();

			if (timeRegistrationTimerModel.Started) {
				if (this.getView().getBindingContext().getObject().Orderid === timeRegistrationTimerModel.OrderId) {
					var text = "";
					if (type === "reassign") {
						text = this.getI18nText("WorkOrderDetails-StopTimerReassignWarning");
					} else if (type === "completeorder") {
						text = this.getI18nText("WorkOrderDetails-StopTimerCompleteOrderWarning");
					}
					sap.m.MessageBox.information(text);
					return true;
				}
			}
			return false;
		},

		onOrderReAssignButtonPressed: function(oEvent) {
			if (this.timerIsRunningForOrder("reassign")) {
				return;
			}

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

							//Clear timeRegistrationTimerModel
							that.getView().getModel("timeRegistrationTimerModel").getData().Started = false;
							that.getView().getModel("timeRegistrationTimerModel").getData().OrderId = "";
							that.getView().getModel("timeRegistrationTimerModel").getData().StartDateTime = "";
							that.getView().getModel("timeRegistrationTimerModel").refresh();

							//Update local storage variable
							that.saveTimerRunningInfoInBrowserCache(false);

							var timeConfirmationsSubSection = that.getView().byId("timeConfirmationsSubSection").getId();
							if (timeConfirmationsSubSection) {
								that.getView().byId("ObjectPageLayout").scrollToSection(timeConfirmationsSubSection, 0, 0);
							}
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

				//Update local storage variable
				this.saveTimerRunningInfoInBrowserCache(true);

				//Update 
				var oContext = this.getView().getBindingContext();
				var currentOrderStatus = oContext.getObject().OrderStatus;

				if (currentOrderStatus === "INITIAL") {
					this.getView().getModel().setProperty("OrderStatus", "INPROGRESS", oContext);
					this.updateOrderStatus();
				}

				sap.m.MessageToast.show(this.getI18nText("WorkOrderDetails-StartWorkMessageToastText"));
			}
		},

		saveTimerRunningInfoInBrowserCache: function() {
			jQuery.sap.require("jquery.sap.storage");

			if (jQuery.sap.storage.isSupported()) {
				//Get Storage object to use
				var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

				// Set value in htlm5 storage 
				oStorage.put("OrderTimer", this.getView().getModel("timeRegistrationTimerModel").getData());
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