sap.ui.define([	"com/twobm/mobileworkorder/util/Controller",	"sap/ui/model/Filter"], function(Controller, Filter) {	"use strict";	return Controller.extend("com.twobm.mobileworkorder.components.itemDetails.blocks.CausesBlock", {		onInit: function() {			// Create popover from fragment			this.createCausePopover();		},		createCausePopover: function() {			// Create popover if it does not exist			if (!this.popover) {				// Create popover				this.popover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.itemDetails.fragments.CausePopover",					this);				// Create view model				this.getView().setModel(new sap.ui.model.json.JSONModel({					isEditing: false				}), "ViewModel");				// Attach popover to view				this.getView().addDependent(this.popover);			}		},		editCausesPress: function(oEvent) {			// Compile the model path for the code group on the item for use later if the user wants to change the code			this.codeGroupBindingContext = "/CodeGroupsSet('A" + this.getView().getModel().getProperty(oEvent.getSource().getBindingContext() +				"/CauseCodegrp") + "')";			// Update view model to indicate we are editing an existing item			this.getView().getModel("ViewModel").setProperty("/isEditing", true);			// Set binding context from list item on popover			this.popover.setBindingContext(oEvent.getSource().getBindingContext());			// Show popover			this.popover.open();		},		onCreateCause: function() {			// Update view model to indicate we are creating a new item			this.getView().getModel("ViewModel").setProperty("/isEditing", false);			// Build path for new entry			var path = this.getView().getBindingContext().getPath() + "/NotifCausesSet";			// Create new entry with default values			this.newEntry = this.getView().getModel().createEntry(path, {				properties: {					CauseSortNo: "0001"				}			});			// Bind new item to popover			this.popover.setBindingContext(this.newEntry);			// Open popover			this.popover.open();		},		onSubmitCause: function() {			// Set view busy			this.popover.setBusy(true);			// Submit the changes			if (this.getView().getModel().hasPendingChanges()) {				this.getView().getModel().submitChanges({					success: function() {						// Reset view busy						this.popover.setBusy(false);						// If we just created a new entity, clear the reference to it						if (this.newEntry) {							this.newEntry = null;						}						// Close the popup						this.popover.close();					}.bind(this),					error: function(error) {						// Reset view busy						this.popover.setBusy(false);						// Show error to user						self.errorCallBackShowInPopUp(error);					}.bind(this)				});			} else {				this.popover.setBusy(false);				this.popover.close();			}		},		onDeleteCause: function() {			// Set view busy			this.popover.setBusy(true);			// Delete from model			this.getView().getModel().remove(this.popover.getBindingContext().getPath(), {				success: function() {					// Reset view busy					this.popover.setBusy(false);					// Close the popup					this.popover.close();				}.bind(this),				error: function(error) {					// Reset view busy					this.popover.setBusy(false);					// Show error to user					self.errorCallBackShowInPopUp(error);				}.bind(this)			});		},		onPopopoverClose: function(oEvent) {			var isEditing = this.getView().getModel("ViewModel").getProperty("/isEditing");			var pendingChanges = this.getView().getModel().hasPendingChanges();						// reset changes in model if user close popOver and is in isEditing			if(isEditing && pendingChanges){				var sPathArr = [];				var sPath = oEvent.getSource().getBindingContext().getPath();				sPathArr.push(sPath);				this.getView().getModel().resetChanges(sPathArr);			}			// If we started creating a new entry..			if (this.newEntry) {				// ..make sure it is removed from the model if the user cancels				this.getView().getModel().deleteCreatedEntry(this.newEntry);				this.newEntry = null;			}			// Close the popup			this.popover.close();		},		handleValueHelpCodeGroup: function(oEvent) {			// Create value help dialog if we dont have one			if (!this.valueHelpCodeGroupDialog) {				this.valueHelpCodeGroupDialog = sap.ui.xmlfragment(this.createId("CauseCodeGroup"),					"com.twobm.mobileworkorder.components.itemDetails.fragments.CauseCodeGroupValueHelp",					this				);				// Attach to view				this.getView().addDependent(this.valueHelpCodeGroupDialog);			}			// Show dialog			this.valueHelpCodeGroupDialog.open();		},		handleValueHelpCode: function(oEvent) {			// Create value help dialog if we dont have one			if (!this.valueHelpCodeDialog) {				this.valueHelpCodeDialog = sap.ui.xmlfragment(this.createId("CauseCode"),					"com.twobm.mobileworkorder.components.itemDetails.fragments.CauseCodeValueHelp",					this				);				// Attach to view				this.getView().addDependent(this.valueHelpCodeDialog);			}			// Bind to parent code group so we show the correct codes			this.valueHelpCodeDialog.bindElement(this.codeGroupBindingContext);			// Show dialog			this.valueHelpCodeDialog.open();		},		handleValueHelpSearchCodeGroup: function(oEvent) {			var sValue = oEvent.getParameter("value");			var oFilter = new Filter(				"Codegroup",				sap.ui.model.FilterOperator.Contains, sValue			);			oEvent.getSource().getBinding("items").filter([oFilter,				new Filter(					"CatalogType",					sap.ui.model.FilterOperator.EQ, "5")			]);			oEvent.getSource().getBinding("items").refresh();		},		handleValueHelpCloseCodeGroup: function(oEvent) {			// Get selected item			var selectedItem = oEvent.getParameter("selectedItem");			if (selectedItem) {				// Update values on model				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/CauseCodegrp", selectedItem.getDescription());				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtCausegrp", selectedItem.getTitle());				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/CauseCode", ""); // reset codeValue				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtCausecd", ""); // reset CodeValueText				this.codeGroupBindingContext = selectedItem.getBindingContext().getPath();			}		},		handleValueHelpAfterCloseCodeGroup: function() {			//Destroy the ValueHelpDialog			this.valueHelpCodeGroupDialog.destroy();		},		handleValueHelpCloseCode: function(oEvent) {			// Get selected item			var selectedItem = oEvent.getParameter("selectedItem");			if (selectedItem) {				// Update values on model				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/CauseCode", selectedItem.getDescription());				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtCausecd", selectedItem.getTitle());			}		},		handleValueHelpAfterCloseCode: function() {			//Destroy the ValueHelpDialog			this.valueHelpCodeDialog.destroy();		}	});});