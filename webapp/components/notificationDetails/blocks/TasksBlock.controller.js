sap.ui.define([	"com/twobm/mobileworkorder/util/Controller",	"sap/ui/model/Filter"], function(Controller, Filter) {	"use strict";	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.blocks.TasksBlock", {		onInit: function() {			// Create popover from fragment			this.createTaskPopover();		},		createTaskPopover: function() {			// Create popover if it does not exist			if (!this.popover) {				// Create popover				this.popover = sap.ui.xmlfragment("com.twobm.mobileworkorder.components.notificationDetails.fragments.TaskPopover",					this);				// Create view model				this.getView().setModel(new sap.ui.model.json.JSONModel({					isEditing: false				}), "ViewModel");				// Attach popover to view				this.getView().addDependent(this.popover);			}		},		editTaskPress: function(oEvent) {			// Compile the model path for the code group on the item for use later if the user wants to change the code			this.codeGroupBindingContext = "/CodeGroupsSet('2" + this.getView().getModel().getProperty(oEvent.getSource().getBindingContext() +				"/TaskCodegrp") + "')";			// Update view model to indicate we are editing an existing item			this.getView().getModel("ViewModel").setProperty("/isEditing", true);			// Set binding context from list item on popover			this.popover.setBindingContext(oEvent.getSource().getBindingContext());			// Show popover			this.popover.open();		},		onCreateTask: function() {			// Update view model to indicate we are creating a new item			this.getView().getModel("ViewModel").setProperty("/isEditing", false);			// Build path for new entry			var path = this.getView().getBindingContext().getPath() + "/NotifTasksSet";			// Create new entry with default values			this.newEntry = this.getView().getModel().createEntry(path, {				properties: {					TaskSortNo: "0001"				}			});			// Bind new item to popover			this.popover.setBindingContext(this.newEntry);			// Open popover			this.popover.open();		},		onSubmitTask: function() {			// Set view busy			this.popover.setBusy(true);			// if there are changes to the model post it to BE.			if (this.getView().getModel().hasPendingChanges()) {				var taskCodeGroup = this.getView().getModel().getProperty(this.popover.getBindingContext().getPath() + "/TaskCodegrp");				var tastCode = this.getView().getModel().getProperty(this.popover.getBindingContext().getPath() + "/TaskCode");				// Validate that both taskCodeGroup and taskCode is selected before sending to BE				if ((taskCodeGroup !== "" && taskCodeGroup !== undefined) && (tastCode !== "" && tastCode !== undefined)) {					// Submit the changes					this.getView().getModel().submitChanges({						success: function() {							// Reset view busy							this.popover.setBusy(false);							// If we just created a new entity, clear the reference to it							if (this.newEntry) {								this.newEntry = null;							}							// Close the popup							this.popover.close();						}.bind(this),						error: function(error) {							// Reset view busy							this.popover.setBusy(false);							// Show error to user							self.errorCallBackShowInPopUp(error);						}.bind(this)					});				} else {					this.popover.setBusy(false);					sap.m.MessageToast.show(this.getI18nText("NotificationDetails-TasksBlock-Warning-SelectCodeAndCodeGroup"));					return;				}			}			// else close the popover without commit to BE			else {				this.popover.setBusy(false);				this.popover.close();			}		},		onDeleteTask: function() {			// Set view busy			this.popover.setBusy(true);			// Delete task form model			this.getView().getModel().remove(this.popover.getBindingContext().getPath(), {				success: function() {					// Reset view busy					this.popover.setBusy(false);					// Close the popup					this.popover.close();				}.bind(this),				error: function(error) {					// Reset view busy					this.popover.setBusy(false);					// Show error to user					self.errorCallBackShowInPopUp(error);				}.bind(this)			});		},		onPopopoverClose: function(oEvent) {			var isEditing = this.getView().getModel("ViewModel").getProperty("/isEditing");			var pendingChanges = this.getView().getModel().hasPendingChanges();			// reset changes in model if user close popOver and is in isEditing			if (isEditing && pendingChanges) {				var sPathArr = [];				var sPath = oEvent.getSource().getBindingContext().getPath();				sPathArr.push(sPath);				this.getView().getModel().resetChanges(sPathArr);			}			// If we started creating a new entry..			if (this.newEntry) {				// ..make sure it is removed from the model if the user cancels				this.getView().getModel().deleteCreatedEntry(this.newEntry);				this.newEntry = null;			}			// Close the popup			this.popover.close();		},		handleValueHelpCodeGroup: function() {			// Create value help dialog if we dont have one			if (!this.valueHelpCodeGroupDialog) {				this.valueHelpCodeGroupDialog = sap.ui.xmlfragment(this.createId("TaskCodeGroup"),					"com.twobm.mobileworkorder.components.notificationDetails.fragments.TaskCodeGroupValueHelp",					this				);				// Attach to view				this.getView().addDependent(this.valueHelpCodeGroupDialog);			}			// Show dialog			this.valueHelpCodeGroupDialog.open();		},		handleValueHelpCode: function() {			// Create value help dialog if we dont have one			if (!this.valueHelpCodeDialog) {				this.valueHelpCodeDialog = sap.ui.xmlfragment(this.createId("TaskCode"),					"com.twobm.mobileworkorder.components.notificationDetails.fragments.TaskCodeValueHelp",					this				);				// Attach to view				this.getView().addDependent(this.valueHelpCodeDialog);			}			// Bind to parent code group so we show the correct codes			this.valueHelpCodeDialog.bindElement(this.codeGroupBindingContext);			// Show dialog			this.valueHelpCodeDialog.open();		},		handleValueHelpSearchCodeGroup: function(oEvent) {			var sValue = oEvent.getParameter("value");			var oFilter = new Filter(				"Codegroup",				sap.ui.model.FilterOperator.Contains, sValue			);			oEvent.getSource().getBinding("items").filter([oFilter,				new Filter(					"CatalogType",					sap.ui.model.FilterOperator.EQ, "2")			]);			oEvent.getSource().getBinding("items").refresh();		},		handleValueHelpCloseCodeGroup: function(oEvent) {			// Get selected item			var selectedItem = oEvent.getParameter("selectedItem");			if (selectedItem) {				// Update values on model				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TaskCodegrp", selectedItem.getDescription());				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtTaskgrp", selectedItem.getTitle());				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TaskCode", ""); // reset CodeValue				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtTaskcd", ""); // reset CodeText				this.codeGroupBindingContext = selectedItem.getBindingContext().getPath();			}		},		handleValueHelpAfterCloseCodeGroup: function() {			//Destroy the ValueHelpDialog			//this.valueHelpCodeGroupDialog.destroy();		},		handleValueHelpCloseCode: function(oEvent) {			// Get selected item			var selectedItem = oEvent.getParameter("selectedItem");			if (selectedItem) {				// Update values on model				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TaskCode", selectedItem.getDescription());				this.getView().getModel().setProperty(this.popover.getBindingContext().getPath() + "/TxtTaskcd", selectedItem.getTitle());			}		},		handleValueHelpAfterCloseCode: function() {			//Destroy the ValueHelpDialog			//this.valueHelpCodeDialog.destroy();		},		handleTaskCodeSearch: function(oEvent) {			var sValue = oEvent.getParameter("value");			var oFilter = new Filter("CodeText", sap.ui.model.FilterOperator.Contains, sValue);			var oBinding = oEvent.getSource().getBinding("items");			oBinding.filter([oFilter]);		},		// formatter function for enable/disable Code input in popover		isTaskCodeGrpEmpty: function(taskGroupValue) {			if (taskGroupValue !== undefined && taskGroupValue !== "") {				return true;			} else {				return false;			}		}	});});