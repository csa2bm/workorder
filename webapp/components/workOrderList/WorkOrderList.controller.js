sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/components/offline/SyncStateHandler",
	"com/twobm/mobileworkorder/components/offline/SyncManager"
], function(Controller, History, SyncStateHandler, SyncManager) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderList.WorkOrderList", {
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			//Is it this page we have navigated to?
			if (sName !== "workOrderList") {
				return;
			}
		},

		onNavigationButtonPress: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("dashboard", true);
			}
		},

		onWorkOrderItemPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			this.getRouter().navTo("workOrderDetails", {
				workOrderContext: oBindingContext.getPath().substr(1)
			});
		},

		// Pop-up for sorting and filter
		handleViewSettingsDialogButtonPressed: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderList.fragments.OrderFilterDialog", this);
				this._oDialog.setModel(this.getView().getModel("i18n"), "i18n");
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		setInitialSorting: function() {
			var oTable = this.getView().byId("workOrderTableId");
			var oBinding = oTable.getBinding("items");

			var aSorters = [];

			var sortItem = "StartDate";
			var sortDescending = true;
			aSorters.push(new sap.ui.model.Sorter(sortItem, sortDescending));
			oBinding.sort(aSorters);
		},

		// Start filter and sorting based on selected.
		handleOrderFilterConfirm: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("workOrderTable");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var aSorters = [];
			// if (mParams.groupItem) {
			// 	var sPath = mParams.groupItem.getKey();
			// 	var bDescending = mParams.groupDescending;
			// 	var vGroup = this.orderGroupFunctions[sPath];
			// 	aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
			// }

			var sortItem = mParams.sortItem.getKey();
			var sortDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sortItem, sortDescending));
			oBinding.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			oBinding.filter(aFilters);

			var model = this.getView().getModel();
			model.refresh();
		},

		getOrderStatusIcon: function(orderStatus, personelNumber, assignedOperation) {
			if (this.getView().getModel("appInfoModel").getData().Persno !== personelNumber && !assignedOperation)
				return "sap-icon://action";

			if (orderStatus === "INITIAL") 
				return "sap-icon://circle-task-2";
			
			if (orderStatus === "INPROGRESS") 
				return "sap-icon://circle-task-2";

			return "sap-icon://circle-task-2";
		},

		getOrderStatusIconColor: function(orderStatus, personelNumber, assignedOperation) {
			
			if (this.getView().getModel("appInfoModel").getData().Persno !== personelNumber && !assignedOperation)
				return "#343434";
				
			if (orderStatus === "INITIAL") {
				return "#DBDBDB";
			} else if (orderStatus === "INPROGRESS") {
				return "#3AACF2";
			} else if (orderStatus === "COMPLETED") {
				return "#30D130";
			}
		},

		orderFilterSelectPopUp: function(oEvent) {
			var oButton = oEvent.getSource();

			// create menu only once
			if (!this._orderFilterMenu) {
				this._orderFilterMenu = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderList.fragments.OrderFilterSelect", this);
				this.getView().addDependent(this._orderFilterMenu);
			}

			//var eDock = sap.ui.core.Popup.Dock;
			this._orderFilterMenu.openBy(oButton); //.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},

		isInErrorState: function(woMatObjIsInErrorState) {
			if (woMatObjIsInErrorState === true) {
				return true;

			}
			return false;
		},

		// 
		isInErrorStateWorkOrder: function(errorsArray, orderId) {
			if ($.inArray(orderId, errorsArray) >= 0) {
				return true;
			} else {
				return false;
			}
		},

		isInErrorStateIconWorkOrder: function(errorsArray, orderId) {
			if ($.inArray(orderId, errorsArray) >= 0) {
				return "sap-icon://error";
			} else {
				return "sap-icon://slim-arrow-right";
			}
		},

		isInErrorStateColorWorkOrder: function(errorsArray, orderId) {
			if ($.inArray(orderId, errorsArray) >= 0) {
				return "Red";
			} else {
				return "Gray";
			}
		},

		isOnline: function() {
			if (sap.hybrid) {
				return false;
			}

			return true;
		},

		onRefresh: function() {
			this.getView().getModel().refresh();
		}
	});
});