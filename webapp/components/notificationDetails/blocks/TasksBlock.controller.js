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
			this.newEntry = this.getView().getModel().createEntry(this.getView().getBindingContext().getPath() + "/NotifTasksSet", {
				success: function () {
					this.popover.close();
				},
				error: self.errorCallBackShowInPopUp
			});
			
			this.newEntry.TaskSortNo = "123";
			
			this.popover.setBindingContext(this.newEntry);
			this.popover.open();
		},
		
		onSubmitTask: function(oEvent) {
			this.getView().getModel().submitChanges();
		},

		onPopopoverClose : function(oEvent){
			this.getView().getModel().deleteCreatedEntry(this.newEntry);
			this.popover.close();
		}
	});
});