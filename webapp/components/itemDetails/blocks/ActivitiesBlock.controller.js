sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/model/Filter"
], function(Controller, Filter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.blocks.ActivitiesBlock", {

		onInit: function() {
			// Create popover from fragment
			this.createActivityPopover();
		},

		createActivityPopover: function() {
			// Create popover if it does not exist
			if (!this.popover) {
				// Create popover
				this.popover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationDetails.fragments.ActivityPopover",
					this);
				// Create view model
				this.getView().setModel( new sap.ui.model.json.JSONModel({ isEditing: false }),"ViewModel");
				// Attach popover to view
				this.getView().addDependent(this.popover);
			}
		},

		onActivityItemPress: function(oEvent) {
			// Compile the model path for the code group on the item for use later if the user wants to change the code
			this.codeGroupBindingContext = "/CodeGroupsSet('A" + this.getView().getModel().getProperty(oEvent.getSource().getBindingContext() + "/ActCodegrp") + "')";
			// Update view model to indicate we are editing an existing item
			this.getView().getModel("ViewModel").setProperty("/isEditing", true);
			// Set binding context from list item on popover
			this.popover.setBindingContext(oEvent.getSource().getBindingContext());
			// Show popover
			this.popover.open();
		},

		onCreateActivity: function() {
			// Update view model to indicate we are creating a new item
			this.getView().getModel("ViewModel").setProperty("/isEditing", false);
			// Build path for new entry
			var path = this.getView().getBindingContext().getPath() + "/NotifActivitiesSet";
			// Create new entry with default values
			this.newEntry = this.getView().getModel().createEntry(path, {
				properties: {
					ActSortNo: "0001"
				}
			});

			// Bind new item to popover
			this.popover.setBindingContext(this.newEntry);
			// Open popover
			this.popover.open();
		},

		onSubmitActivity: function() {
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

		onDeleteActivity: function() {
			// Set view busy
			this.popover.setBusy(true);
			// Delete from model
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
		},
		
		handleValueHelpCodeGroup: function(oEvent) {
			// Create value help dialog if we dont have one
			if (!this.valueHelpCodeGroupDialog) {
				this.valueHelpCodeGroupDialog = sap.ui.xmlfragment(this.createId("ActivityCodeGroup"),
					"com.twobm.mobileworkorder.components.notificationDetails.fragments.ActivityCodeGroupValueHelp",
					this
				);
				// Attach to view
				this.getView().addDependent(this.valueHelpCodeGroupDialog);
			}
			// Show dialog
			this.valueHelpCodeGroupDialog.open();
		},
		
		handleValueHelpCode: function(oEvent) {
			// Create value help dialog if we dont have one
			if (!this.valueHelpCodeDialog) {
				this.valueHelpCodeDialog = sap.ui.xmlfragment(this.createId("ActivityCode"),
					"com.twobm.mobileworkorder.components.notificationDetails.fragments.ActivityCodeValueHelp",
					this
				);
				// Attach to view
				this.getView().addDependent(this.valueHelpCodeDialog);
			}
			// Bind to parent code group so we show the correct codes
			this.valueHelpCodeDialog.bindElement(this.codeGroupBindingContext);
			// Show dialog
			this.valueHelpCodeDialog.open();
		},
		
		handleValueHelpSearchCodeGroup: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Codegroup",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter,
			new Filter(
				"CatalogType",
				sap.ui.model.FilterOperator.EQ,  "2")]);
				
			oEvent.getSource().getBinding("items").refresh();
		},
		
		handleValueHelpCloseCodeGroup: function(oEvent) {
			// Get selected item
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				// Update values on model
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/ActCodegrp", selectedItem.getDescription());
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtActgrp", selectedItem.getTitle());
				this.codeGroupBindingContext = selectedItem.getBindingContext().getPath();		
				
			}
		},

		handleValueHelpAfterCloseCodeGroup: function() {
			//Destroy the ValueHelpDialog
			this.valueHelpCodeGroupDialog.destroy();
		},
		
		handleValueHelpCloseCode: function(oEvent) {
			// Get selected item
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				// Update values on model
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/ActCode", selectedItem.getDescription());
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtActcd", selectedItem.getTitle());
			}
		},

		handleValueHelpAfterCloseCode: function() {
			//Destroy the ValueHelpDialog
			this.valueHelpCodeDialog.destroy();
		}
	});
});