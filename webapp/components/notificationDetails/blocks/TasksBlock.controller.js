sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.blocks.TasksBlock", {

		onInit: function() {
			this.createTaskPopover();
		},

		createTaskPopover: function() {
			if (!this.popover) {
				this.popover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationDetails.fragments.TaskPopover",
					this);

				this.getView().addDependent(this.popover);
			}
		},
		
		onCreateTask: function(oEvent) {
			this.popover.open();
		}
	});
});