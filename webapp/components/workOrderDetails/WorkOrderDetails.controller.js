sap.ui.controller("com.twobm.mobileworkorder.components.workOrderDetails.WorkOrderDetails", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf view.View1
	 */
		onInit: function() {
		var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					Number : "45000312",
					Type : "ZM01 - Preventive",
					Priority : "Medium",
					ShortText : "Replace bearings",
					LongText : "",
					Start: "10.11.2015 11:00",
					End: "10.11.2015 12:00",
					Objects: [{
						FunctionalLocationNumber : "13221031",
						FunctionalLocationDescription: "Big Machine A",
						EquipmentNumber : "23182039",
						EquipmentDescription : "Front Bearing"
					},
					{
						FunctionalLocationNumber : "13221031",
						FunctionalLocationDescription: "Big Machine A",
						EquipmentNumber : "23182040",
						EquipmentDescription : "Center Bearing"
					},
					{
						FunctionalLocationNumber : "13221031",
						FunctionalLocationDescription: "Big Machine A",
						EquipmentNumber : "23182041",
						EquipmentDescription : "Rear Bearing"
					}],
					Operations: [{
						Number: "0010",
						ShortText: "Replace XT bearing with XTR version",
						FunctionalLocationNumber : "12345",
						FunctionalLocationDescription: "Big Machine A",
						EquipmentNumber : "53321",
						EquipmentDescription : "Rear Bearing"
					}],
					Materials:[{
						Number : "31451233",
						Description : "XTR bearing",
						ReservedQuantity: "3",
						WithdrawnQuantity: "0"
					},
					{
						Number : "31453433",
						Description : "1L Bearing Oil",
						ReservedQuantity: "1",
						WithdrawnQuantity: "0"
					}],
					Errors: [{
						Message: "Work order was blocked by user XORAS"
					},
					{
						Message: "General error occured"
					}]
				});
				
				this.getView().setModel(oModel);
		},

	onNavButtonPress: function(){
		var app = sap.ui.getCore().byId("WorkOrder");
		app.back();
	}

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf view.View1
	 */
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf view.View1
	 */
	//	onAfterRendering: function() {
	//
	//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf view.View1
	 */
	//	onExit: function() {
	//
	//	}

});