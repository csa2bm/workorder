sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.blocks.ObjectsBlock", {
		
		onEquipmentItemPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			var data = {
				"block": "object",
				"objectContext": oBindingContext.getPath().substr(1)
			};
			this.gotoEquipmentDetailsPage(data);
		},
		
		gotoEquipmentDetailsPage: function(data) {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("BlockNavigation", data);
		}
	});
});