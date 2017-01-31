sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/model/Filter"
], function(Controller, Filter) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.blocks.ItemsBlock", {

		onInit: function() {
			// Create popover from fragment
			this.createPopover();
		},

		createPopover: function() {
			// Create popover if it does not exist
			if (!this.popover) {
				// Create popover
				this.popover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationDetails.fragments.ItemPopover",
					this);
				// Create view model
				this.getView().setModel(new sap.ui.model.json.JSONModel({
					isEditing: false
				}), "ViewModel");
				// Attach popover to view
				this.getView().addDependent(this.popover);
			}
		},

		onItemPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			var data = {
				"block": "item",
				"itemContext": oBindingContext.getPath().substr(1)
			};
			this.goToItemDetailsPage(data);
		},
		goToItemDetailsPage: function(data) {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("BlockNavigationNotification", data);
		},

		editItemPress: function(oEvent) {
			// Compile the model path for the code group on the item for use later if the user wants to change the code
			this.codeGroupBindingContext = "/CodeGroupsSet('B" + this.getView().getModel().getProperty(oEvent.getSource().getBindingContext() +
				"/DlCodegrp") + "')";
			this.damangeCodeGroupBindingContext = "/CodeGroupsSet('C" + this.getView().getModel().getProperty(oEvent.getSource().getBindingContext() +
				"/DCodegrp") + "')";
			// Update view model to indicate we are editing an existing item
			this.getView().getModel("ViewModel").setProperty("/isEditing", true);
			// Set binding context from list item on popover
			this.popover.setBindingContext(oEvent.getSource().getBindingContext());
			// Show popover
			this.popover.open();
		},

		onCreate: function() {
			// Update view model to indicate we are creating a new item
			this.getView().getModel("ViewModel").setProperty("/isEditing", false);
			// Build path for new entry
			var path = this.getView().getBindingContext().getPath() + "/NotifItemsSet";
			// Create new entry with default values
			//ItemSortNo must be empty. It is set in the BE service
			this.newEntry = this.getView().getModel().createEntry(path, {
				properties: {
					ItemSortNo: ""
				}
			});

			// Bind new item to popover
			this.popover.setBindingContext(this.newEntry);
			// Open popover
			this.popover.open();
		},

		onSubmit: function() {
			// Set view busy
			this.popover.setBusy(true);

			// if there are changes to the model post it to BE.
			if (this.getView().getModel().hasPendingChanges()) {
				// Submit the changes
				this.getView().getModel().submitChanges({
					success: function() {
						// Reset view busy
						this.popover.setBusy(false);
						// If we just created a new entity, clear the reference to it
						if (this.newEntry) {
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
			}
			// else close the popover without commit to BE
			else {
				this.popover.setBusy(false);
				this.popover.close();
			}
		},

		onDelete: function() {
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
			var isEditing = this.getView().getModel("ViewModel").getProperty("/isEditing");
			var pendingChanges = this.getView().getModel().hasPendingChanges();
			
			// reset changes in model if user close popOver and is in isEditing
			if(isEditing && pendingChanges){
				var sPathArr = [];
				var sPath = oEvent.getSource().getBindingContext().getPath();
				sPathArr.push(sPath);
				this.getView().getModel().resetChanges(sPathArr);
			}
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
				this.valueHelpCodeGroupDialog = sap.ui.xmlfragment(this.createId("ItemCodeGroup"),
					"com.twobm.mobileworkorder.components.notificationDetails.fragments.ItemPartCodeGroupValueHelp",
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
				this.valueHelpCodeDialog = sap.ui.xmlfragment(this.createId("ItemCode"),
					"com.twobm.mobileworkorder.components.notificationDetails.fragments.ItemPartCodeValueHelp",
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

		handleDamageValueHelpCodeGroup: function(oEvent) {
			// Create value help dialog if we dont have one
			if (!this.valueHelpDamageCodeGroupDialog) {
				this.valueHelpDamageCodeGroupDialog = sap.ui.xmlfragment(this.createId("ItemDamageCodeGroup"),
					"com.twobm.mobileworkorder.components.notificationDetails.fragments.ItemDamageCodeGroupValueHelp",
					this
				);
				// Attach to view
				this.getView().addDependent(this.valueHelpDamageCodeGroupDialog);
			}
			// Show dialog
			this.valueHelpDamageCodeGroupDialog.open();
		},

		handleDamageValueHelpCode: function(oEvent) {
			// Create value help dialog if we dont have one
			if (!this.valueDamageHelpCodeDialog) {
				this.valueDamageHelpCodeDialog = sap.ui.xmlfragment(this.createId("ItemDamageCode"),
					"com.twobm.mobileworkorder.components.notificationDetails.fragments.ItemDamageCodeValueHelp",
					this
				);
				// Attach to view
				this.getView().addDependent(this.valueDamageHelpCodeDialog);
			}
			// Bind to parent code group so we show the correct codes
			this.valueDamageHelpCodeDialog.bindElement(this.damangeCodeGroupBindingContext);
			// Show dialog
			this.valueDamageHelpCodeDialog.open();
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
					sap.ui.model.FilterOperator.EQ, "2")
			]);

			oEvent.getSource().getBinding("items").refresh();
		},

		handleValueHelpCloseCodeGroup: function(oEvent) {
			// Get selected item
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				// Update values on model
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/DlCodegrp", selectedItem.getDescription());
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtGrpcd", selectedItem.getTitle());
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/DlCode", ""); // reset CodeValue
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtObjptcd", ""); // reset CodeText
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
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/DlCode", selectedItem.getDescription());
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtObjptcd", selectedItem.getTitle());
			}
		},

		handleValueHelpAfterCloseCode: function() {
			//Destroy the ValueHelpDialog
			//this.valueHelpCodeDialog.destroy();
		},

		handleValueDamageHelpCloseCodeGroup: function(oEvent) {
			// Get selected item
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				// Update values on model
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/DCodegrp", selectedItem.getDescription());
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/StxtGrpcd", selectedItem.getTitle());
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/DCode", ""); // reset CodeValue
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtProbcd", ""); // reset CodeText
				this.damangeCodeGroupBindingContext = selectedItem.getBindingContext().getPath();

			}
		},
		handleValueDamageHelpAfterCloseCodeGroup: function() {
			//Destroy the ValueHelpDialog
			//this.valueHelpDamageCodeGroupDialog.destroy();
		},

		handleValueDamageHelpCloseCode: function(oEvent) {
			// Get selected item
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				// Update values on model
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/DCode", selectedItem.getDescription());
				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtProbcd", selectedItem.getTitle());
			}
		},

		handleValueHelpAfterCloseCode: function() {
			//Destroy the ValueHelpDialog
			//this.valueDamageHelpCodeDialog.destroy();
		}
	});
});