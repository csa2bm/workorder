sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.blocks.TasksBlock", {

		onInit: function() {
			// Create popover from fragment
			this.createTaskPopover();
		},

		createTaskPopover: function() {
			// Create popover if it does not exist
			if (!this.popover) {
				// Create popover
				this.popover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationDetails.fragments.TaskPopover",
					this);
				// Create view model
				this.getView().setModel( new sap.ui.model.json.JSONModel({ isEditing: false }),"ViewModel");
				// Attach popover to view
				this.getView().addDependent(this.popover);
			}
		},

		onTaskItemPress: function(oEvent) {
			// Update view model to indicate we are editing an existing item
			this.getView().getModel("ViewModel").setProperty("/isEditing", true);
			// Set binding context from list item on popover
			this.popover.setBindingContext(oEvent.getSource().getBindingContext());
			// Show popover
			this.popover.open();
		},

		onCreateTask: function() {
			// Update view model to indicate we are creating a new item
			this.getView().getModel("ViewModel").setProperty("/isEditing", false);
			// Build path for new entry
			var path = this.getView().getBindingContext().getPath() + "/NotifTasksSet";
			// Create new entry with default values
			this.newEntry = this.getView().getModel().createEntry(path, {
				properties: {
					TaskSortNo: "0000"
				}
			});

			// Bind new item to popover
			this.popover.setBindingContext(this.newEntry);
			// Open popover
			this.popover.open();
		},

		onSubmitTask: function() {
			// Set view busy
			this.popover.setBusy(true);
			// Submit the changes
			this.getView().getModel().submitChanges({
				success: function() {
					// Reset view busy
					this.popover.setBusy(false);
					// If we just created a new entity, clear the reference to it
					if(this.newEntry)
					{
						this.newEntry = null;
					}
					// Close the popup
					this.popover.close();
				}.bind(this),
				error: function(error) {
					// Reset view busy
					this.popover.setBusy(false);
					// Show error to user
					self.errorCallBackShowInPopUp(error);
				}.bind(this)
			});
		},

		onDeleteTask: function() {
			// Set view busy
			this.popover.setBusy(true);
			// Delete task form model
			this.getView().getModel().remove(this.popover.getBindingContext().getPath(), {
				success: function() {
					// Reset view busy
					this.popover.setBusy(false);
					// Close the popup
					this.popover.close();
				}.bind(this),
				error: function(error) {
					// Reset view busy
					this.popover.setBusy(false);
					// Show error to user
					self.errorCallBackShowInPopUp(error);
				}.bind(this)
			});
		},

		onPopopoverClose: function() {
			// If we started creating a new entry..
			if (this.newEntry) {
				// ..make sure it is removed from the model if the user cancels
				this.getView().getModel().deleteCreatedEntry(this.newEntry);
				this.newEntry = null;
			}
			// Close the popup
			this.popover.close();
		}
	});
});