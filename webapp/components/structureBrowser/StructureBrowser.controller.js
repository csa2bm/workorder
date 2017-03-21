sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function(Controller, JSONModel, History) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.structureBrowser.StructureBrowser", {

		 

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.structureBrowser.view.structureBrowser
		 */
		onInit: function() {
			

			this.getView().setModel(new JSONModel({
				parentView: ""
			}), "visibleSelectButtonModel");

			this.getRouter().getRoute("structureBrowser").attachMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			var model = this.getView().getModel("visibleSelectButtonModel");

			// set the binding model for select button
			if (oArguments.notificationContext && oArguments.parentView === "notificationCreate") {
				model.setProperty("/parentView", oArguments.parentView);
			} else {
				model.setProperty("/parentView", "");
			}
			model.refresh();
			
			this.viewModel = [];
			
			this.getView().setModel(new JSONModel({
				items: this.viewModel
			}), "viewModel");
					
			this.getFunctionalLocationswithoutParewnt();
		},

	

		onPressItem: function(oEvent) {
			var bindingContext = oEvent.getSource().getBindingContextPath();
			var item = this.getView().getModel("viewModel").getProperty(bindingContext);

			if (!item.expanded && !item.leaf) {
				item.expanded = true;

				if (item.parentId === "") {
					item.level = 0;
				}

				//	var children = [];

				if (item.type === "FUNCTIONAL_LOCATION") {
					this.getFunctionalLocationsByParent(item);
					//children = children.concat(this.getFunctionalLocationsByParent(item.id));
					//children = children.concat(this.getEquipmentByParentFunctionalLocation(item.id));
				} else {
					//	children = children.concat(this.getEquipmentByParentEquipment(item.id));
					this.getEquipmentByParentEquipment(item);
				}

			} else {
				this.closeItem(item);
			}

		},

	getFunctionalLocationswithoutParewnt: function() {
			this.getView().setBusy(true);
			var filters = new Array();
			var filterByName = new sap.ui.model.Filter("ParentFuncLoc", sap.ui.model.FilterOperator.EQ, "");
			filters.push(filterByName);
			var url = "/FunctionalLocationsSet";
			this.getView().getModel().read(url, {
				filters: filters,
				success: function(result) {
					var results = result.results;
					var children = [];

					for (var i = 0; i < results.length; i++) {
						var currentResult = results[i];

						children[children.length] = {
							name: currentResult.FunctionalLocation,
							description: currentResult.Description,
							id: currentResult.FunctionalLocation,
							parentId: currentResult.ParentFuncLoc,
							leaf: currentResult.Isleaf,
							type: "FUNCTIONAL_LOCATION",
							level: 0
						};

						this.viewModel.splice(i, 0, children[i]);
					}
					
			
					
					this.getView().getModel("viewModel").refresh();
					this.getView().setBusy(false);
				}.bind(this),
				error: function(error) {
					this.getView().setBusy(false);
				}
			});
		},

		getFunctionalLocationsByParent: function(item) {
			var itemIndex = this.viewModel.findIndex(function(currentItem) {
				return currentItem.id === item.id;
			});

			var filters = new Array();
			var filterByName = new sap.ui.model.Filter("ParentFuncLoc", sap.ui.model.FilterOperator.EQ, item.id);
			filters.push(filterByName);
			var url = "/FunctionalLocationsSet";
			item.busy = true;
			this.getView().getModel().read(url, {
				filters: filters,
				success: function(result) {
					var results = result.results;
					var children = [];

					for (var i = 0; i < results.length; i++) {
						var currentResult = results[i];

						children[children.length] = {
							name: currentResult.FunctionalLocation,
							description: currentResult.Description,
							id: currentResult.FunctionalLocation,
							parentId: currentResult.ParentFuncLoc,
							leaf: currentResult.Isleaf,
							type: "FUNCTIONAL_LOCATION",
							level: item.level + 1
						};

						this.viewModel.splice(itemIndex + 1 + i, 0, children[i]);
					}
					
					this.getEquipmentByParentFunctionalLocation(item);
				}.bind(this),
				error: function(error) {
					item.busy = false;
				}
			});
		},

		getEquipmentByParentFunctionalLocation: function(item) {
		var itemIndex = this.viewModel.findIndex(function(currentItem) {
				return currentItem.id === item.id;
			});

			var filters = new Array();
			var filterByFLParent = new sap.ui.model.Filter("Funcloc", sap.ui.model.FilterOperator.EQ, item.id);
			filters.push(filterByFLParent);
			var filterByNoEQUParent = new sap.ui.model.Filter("ParentEquipment", sap.ui.model.FilterOperator.EQ, "");
			filters.push(filterByNoEQUParent);
			var url = "/EquipmentsSet";
			this.getView().getModel().read(url, {
				filters: filters,
				success: function(result) {
					var results = result.results;
					var children = [];

					for (var i = 0; i < results.length; i++) {
						var currentResult = results[i];

						children[children.length] = {
							name: currentResult.Equipment,
							description: currentResult.Description,
							id: currentResult.Equipment,
							parentId: currentResult.Funcloc,
							leaf: currentResult.Isleaf,
							type: "EQUIPMENT",
							level: item.level + 1
						};

						this.viewModel.splice(itemIndex + 1 + i, 0, children[i]);
					}
					
					item.busy = false;
					this.getView().getModel("viewModel").refresh();
				}.bind(this),
				error: function(error) {
					item.busy = false;
				}
			});
		},

		getEquipmentByParentEquipment: function(item) {
			var itemIndex = this.viewModel.findIndex(function(currentItem) {
				return currentItem.id === item.id;
			});

			var filters = new Array();
			var filterByEQParent = new sap.ui.model.Filter("ParentEquipment", sap.ui.model.FilterOperator.EQ, item.id);
			filters.push(filterByEQParent);
			var url = "/EquipmentsSet";
			this.getView().getModel().read(url, {
				filters: filters,
				success: function(result) {
					var results = result.results;
					var children = [];

					for (var i = 0; i < results.length; i++) {
						var currentResult = results[i];

						children[children.length] = {
							name: currentResult.Equipment,
							description: currentResult.Description,
							id: currentResult.Equipment,
							parentId: currentResult.Funcloc,
							leaf: currentResult.Isleaf,
							type: "EQUIPMENT",
							level: item.level + 1
						};

						this.viewModel.splice(itemIndex + 1 + i, 0, children[i]);
					}
					
					item.busy = false;
					this.getView().getModel("viewModel").refresh();
				}.bind(this),
				error: function(error) {
					item.busy = false;
				}
			});
		},

		closeItem: function(item) {
			var children = this.viewModel.filter(function(currentItem) {
				if (item.type === "FUNCTIONAL_LOCATION") {
					return currentItem.parentId === item.id || (currentItem.parentFunctionalLocationId === item.id && !currentItem.parentEquipmentId);
				} else {
					return currentItem.parentEquipmentId === item.id;
				}
			});
			for (var i = 0; i < children.length; i++) {
				this.closeItem(children[i]);
				var itemIndex = this.viewModel.findIndex(function(currentItem) {
					return currentItem.id === children[i].id;
				});
				this.viewModel.splice(itemIndex, 1);
				item.expanded = false;
			}

			this.getView().getModel("viewModel").refresh();
		},

		isLeaf: function(isLeaf, expanded) {
			if (expanded) {
				return "sap-icon://navigation-down-arrow";
			} else if (!isLeaf) {
				return "sap-icon://navigation-right-arrow";
			}

			return "";
		},

		typeIcon: function(type) {
			if (type === "FUNCTIONAL_LOCATION") {
				return "sap-icon://functional-location";
			}

			return "sap-icon://wrench";
		},

		indentForLevel: function(level, text) {
			for (var i = 0; i < level; i++) {
				text = "\u00a0\u00a0\u00a0\u00a0\u00a0" + text;
			}

			return text;
		},

		navigateBack: function(oEvent) {
			window.history.go(-1);
			/*
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getRouter();
				oRouter.navTo("workOrderList", true);
			}

			this.scrollToTop();*/
		},

		onDetailsPress: function(oEvent) {
			//var oBindingContext = oEvent.getSource().getBindingContext("ViewModel");

			if (this.getView().getModel("viewModel").getProperty(oEvent.getSource().getBindingContext("viewModel").getPath()).type ===
				"EQUIPMENT") {

				var objecContext = "/EquipmentsSet('" + this.getView().getModel("viewModel").getProperty(oEvent.getSource().getBindingContext(
					"viewModel").getPath()).name + "')";

				this.getRouter().navTo("equipmentDetails", {
					objectContext: objecContext.substr(1)

				}, false);
			} else {
				var funcObjectContext = "/FunctionalLocationsSet('" + this.getView().getModel("viewModel").getProperty(oEvent.getSource().getBindingContext(
					"viewModel").getPath()).name + "')";

				this.getRouter().navTo("functionalLocationDetails", {
					objectContext: funcObjectContext.substr(1)

				}, false);
			}
		},

		// gotoEquipmentDetailsPage: function(data) {
		// 	var eventBus = sap.ui.getCore().getEventBus();
		// 	eventBus.publish("BlockNavigation", data);
		// },

		onSelectBtnPress: function(oEvent) {
			var object = this.getView().getModel("viewModel").getProperty(oEvent.getSource().getBindingContext(
				"viewModel").getPath());

			var selectObjectForNewNotificationModel = this.getView().getModel("selectObjectForNewNotificationModel");

			if (object.type !== "EQUIPMENT") {
				selectObjectForNewNotificationModel.getData().equipmentNo = "NONE";
				selectObjectForNewNotificationModel.getData().equipmentDesc = "NONE";
				selectObjectForNewNotificationModel.getData().functionalLoc = object.name;
				selectObjectForNewNotificationModel.getData().funcLocDesc = object.description;

				/*				oRouter.navTo("notificationCreate", {
									equipmentNo: "NONE",
									equipmentDesc: "NONE",
									functionalLoc: object.name,
									funcLocDesc: object.description,
									argAvailable: true
								}, false);*/

			} else {

				selectObjectForNewNotificationModel.getData().equipmentNo = object.name;
				selectObjectForNewNotificationModel.getData().equipmentDesc = object.description;
				selectObjectForNewNotificationModel.getData().functionalLoc = object.parentFunctionalLocationName;
				selectObjectForNewNotificationModel.getData().funcLocDesc = object.parentFunctionalLocationdescription;

				// oRouter.navTo("notificationCreate", {
				// 	equipmentNo: object.name,
				// 	equipmentDesc: object.description,
				// 	functionalLoc: object.parentFunctionalLocationName,
				// 	funcLocDesc: object.parentFunctionalLocationdescription,
				// 	argAvailable: true

				// }, true);
			}

			selectObjectForNewNotificationModel.refresh();

			this.navigateBack();
		},

		//formatter function to either show or hide the button
		EnableButtonVisbleCheck: function(str) {
			if (str === "notificationCreate") {
				return true;
			} else {
				return false;
			}
		},

		onSearch: function() {
			this.getRouter().navTo("structureSearch");
		},

		formatIndentWidth: function(level) {
			if (level === undefined)
				level = 0;

			return (level * 2) + "em";
		}
	});
});