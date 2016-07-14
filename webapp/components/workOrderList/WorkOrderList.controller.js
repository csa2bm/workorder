sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"

], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderList.WorkOrderList", {
		onInit: function() {
			/*
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				data: [{
					Number: "45000312",
					Type: "ZM01 - Preventive",
					Priority: "Medium",
					ShortText: "Replace bearings",
					Start: "10.11.2015 09.00",
					End: "10.11.2015 10.00",
					FunctionalLocationNumber: "13221031",
					FunctionalLocationDescription: "Big Machine A",
					EquipmentNumber: "23182019",
					EquipmentDescription: "Bearing Assembly",
					StatusIcon: "sap-icon://slim-arrow-right",
					StatusIconColor: "Gray"
				}, {
					Number: "45000314",
					Type: "ZM01 - Preventive",
					Priority: "Medium",
					ShortText: "Replace bearings",
					Start: "10.11.2015 11:00",
					End: "10.11.2015 12:00",
					FunctionalLocationNumber: "13221032",
					FunctionalLocationDescription: "Big Machine B",
					EquipmentNumber: "23182190",
					EquipmentDescription: "Bearing Assembly",
					StatusIcon: "sap-icon://message-error",
					StatusIconColor: "Red"

				}, {
					Number: "45000315",
					Type: "ZM01 - Preventive",
					Priority: "Medium",
					ShortText: "Replace bearings",
					Start: "10.11.2015 12:45",
					End: "10.11.2015 13:45",
					FunctionalLocationNumber: "13221033",
					FunctionalLocationDescription: "Big Machine C",
					EquipmentNumber: "23182021",
					EquipmentDescription: "Bearing Assembly",
					StatusIcon: "sap-icon://slim-arrow-right",
					StatusIconColor: "Gray"
				}]
			});

			this.getView().setModel(oModel);
			*/
		},
		onWorkOrderItemPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(); 
			this.getRouter().navTo("workOrderDetails",{
				workOrderContext : oBindingContext.getPath().substr(1)
			});

		},

		// Pop-up for sorting and filter
		handleViewSettingsDialogButtonPressed: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.workOrderList.controls.OrderFilterDialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		setInitialSorting: function() {

			var oTable = this.getView().byId("orderList");
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
			var oTable = oView.byId("workOrderTableId");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var aSorters = [];
			if (mParams.groupItem) {
				var sPath = mParams.groupItem.getKey();
				var bDescending = mParams.groupDescending;
				var vGroup = this.orderGroupFunctions[sPath];
				aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
			}

			var sortItem = mParams.sortItem.getKey();
			var sortDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sortItem, sortDescending));
			oBinding.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			oBinding.filter(aFilters);

			// update filter bar
			//oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			//oView.byId("vsdFilterLabel").setText(mParams.filterString);

			//this.refreshData();
			var model = this.getView().getModel();
			model.refresh();
		}
	});
});