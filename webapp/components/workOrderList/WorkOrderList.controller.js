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
		onItemPress: function(oEvent) {
			//var app = sap.ui.getCore().byId("WorkOrder");  
			//app.to("WorkOrderDetails");
			//var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("workOrderDetails", {
				workOrderId: "1235"
			});

		}
	});
});