sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Formatter"
], function(Controller, Formatter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.blocks.GeneralBlock", {
		formatter: Formatter,
		
		getOrderStatusIconColor: function(orderStatus) {
			if (orderStatus === this.getI18nText("orderStatusNotStarted")) {
				return "#DBDBDB";
			} else if (orderStatus === this.getI18nText("orderStatusInProgress")) {
				return "#3AACF2";
			} else if (orderStatus === this.getI18nText("orderStatusCompleted")) {
				return "#30D130";
			}
		}
	});
});