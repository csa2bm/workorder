sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.WorkOrderDetails", {
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("workOrderDetails").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
		/*	var oView = this.getView();
			
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").workOrderContext,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function(oEvent) {
						oView.setBusy(true);
					},
					dataReceived: function(oEvent) {
						oView.setBusy(false);
					}
				}
				
				
			});
			*/
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
				}

				//do we have this context loaded in our model? We should always have a timeregistration entry
				if (this.ExpandLoaded) { //this.getView().getBindingContext().getObject()) {

					//if yes, refresh the model to reflect in memory model any changes done remotely to the order
					this.getView().getBindingContext().getModel().refresh(); //using true as argument got strange errors to arise

					//Update lists
					//Fix to get the lists to update after coming back to page with the same context
					//this.getEventBus().publish("ChecklistsUpdate");
					//this.getEventBus().publish("AttachmentsUpdate");

					//this.scrollToTop();
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

						}, true);
				}
		},
		
		
		_onBindingChange: function(oEvent) {
			// No data for the binding
			if (!this.getView().getBindingContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},
		
		onNavigationButtonPress: function(oEvent){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("workOrderList", true);
			}	
		},
		
		orderStatusBtnPressed: function(oEvent) {
			//var oButton = oEvent.getSource();
			var oContext = this.getView().getBindingContext();
			var OrderStatus = this.getView().getModel().getProperty("orderStatus", oContext);
			this.setUserStatusTaskStarted(OrderStatus);
			
			/*

			// create menu only once
			if (!this._orderStatusMenu) {
				this._orderStatusMenu = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderDetails.controls.OrderStatusChangeMenu", this);
				this.getView().addDependent(this._orderStatusMenu);
			}

			//var eDock = sap.ui.core.Popup.Dock;
			this._orderStatusMenu.openBy(oButton); //.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
			*/
		},
		
		setUserStatusTaskStarted: function(orderStatus) {
			var message = this.getI18nText("orderStatusMessage" + orderStatus);
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
						if (orderStatus === that.getI18nText("orderStatusNotStarted")) {
							//that.onNavBack();
							console.log("Order status: Not started");
						}
						// Set the order status to "completed" and post it
						else if(orderStatus === that.getI18nText("orderStatusInProgress")){
							console.log("Order status: In progress");
						}
						
						else {
							return;
							/*
							var requiredMessage = that.getI18nText("messageBoxTextRequiredChecklistsNotCompleted");

							sap.m.MessageBox.show(requiredMessage, {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: that.getI18nText("messageBoxHeaderRequiredChecklistsNotCompleted"),
								actions: [sap.m.MessageBox.Action.OK],
								defaultAction: sap.m.MessageBox.Action.OK,
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							});
							*/
						}
						var oContext = that.getView().getBindingContext();
						that.getView().getModel().setProperty("OrderStatus", orderStatus, oContext);
						
					}
				}
			});

		},
		getOrderStatusBtnText: function(sString){
			var btnText = this.getI18nText("orderStatusBtnTextNotStarted");
			if(sString === this.getI18nText("orderStatusNotStarted")){
				btnText = this.getI18nText("orderStatusBtnTextNotStarted");
			}
			else if(sString === this.getI18nText("orderStatusInProgress")){
				btnText = this.getI18nText("orderStatusBtnTextInProgress");
			}/*
			else if(sString === this.getI18nText("orderStatusCompleted")){
				btnText = this.getI18nText("orderStatusBtnTextNotStarted");
			}
			*/
			else{
					btnText = this.getI18nText("orderStatusBtnTextCompleted");
			}
			return btnText;
		},
		isOrderNotCompleted: function(sString){
			if(sString === this.getI18nText("orderStatusCompleted")){
				return false;
			}
			else{
				return true;
			}
		}

	});
});