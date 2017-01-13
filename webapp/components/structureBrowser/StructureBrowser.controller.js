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
			// Create demo data
			this.createDemoData();
			
			this.getView().setModel(new JSONModel({
				parentView: ""
			}), "visibleSelectButtonModel");
			
			this.getRouter().getRoute("structureBrowser").attachMatched(this.onRouteMatched,this);
		},
		
		onRouteMatched: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			var model = this.getView().getModel("visibleSelectButtonModel");
			
			if(oArguments.notificationContext && oArguments.parentView==="notificationCreate"){
				model.setProperty("/parentView", oArguments.parentView);
			}
			else{
				model.setProperty("/parentView", "");
			}
			model.refresh();
		},

		createDemoData: function() {
			this.data = {
				FunctionalLocations: [{
					name: "2BM--LIV",
					description: "Livjægergade",
					id: 1,
					parentId: "",
					leaf: false,
					type: "FUNCTIONAL_LOCATION"
				}, {
					name: "2BM--LIV-CA",
					description: "Livjægergade - Cars",
					id: 2,
					parentId: 1,
					leaf: false,
					type: "FUNCTIONAL_LOCATION"
				}, {
					name: "DK",
					description: "Denmark",
					id: 3,
					parentId: "",
					leaf: false,
					type: "FUNCTIONAL_LOCATION"
				}, 
				{
					name: "DK-BU",
					description: "Business Unit",
					id: 5,
					parentId: 3,
					leaf: false,
					type: "FUNCTIONAL_LOCATION"
				}, {
					name: "DK-BU-ST",
					description: "Stations",
					id: 6,
					parentId: 5,
					leaf: false,
					type: "FUNCTIONAL_LOCATION"
				}, {
					name: "DK-BU-ST-S1",
					description: "Station 1",
					id: 10,
					parentId: 6,
					leaf: false,
					type: "FUNCTIONAL_LOCATION"
				}, {
					name: "DK-BU-ST-S2",
					description: "Station 2",
					id: 11,
					parentId: 6,
					leaf: false,
					type: "FUNCTIONAL_LOCATION"
				}, {
					name: "DK-BU-ST-S3",
					description: "Station 3",
					id: 12,
					parentId: 6,
					leaf: false,
					type: "FUNCTIONAL_LOCATION"
				}, {
					name: "DK-BU-ST-S4",
					description: "Station 4",
					id: 13,
					parentId: 6,
					leaf: true,
					type: "FUNCTIONAL_LOCATION"
				}, {
					name: "DK-BU-ST-S5",
					description: "Station 5",
					id: 14,
					parentId: 6,
					leaf: true,
					type: "FUNCTIONAL_LOCATION"
				}],
				Equipment: [
					{
						name: "10000000",
						description: "VW Golf 1.6 diesel",
						id: 7,
						parentFunctionalLocationId: 2,
						leaf: false,
						type: "EQUIPMENT"
					}, {
						name: "10000001",
						description: "1.6 R4 16v TDI CR 55-85kW (engine)",
						id: 8,
						parentFunctionalLocationId: 2,
						parentEquipmentId: 7,
						leaf: true,
						type: "EQUIPMENT"
					}, {
						name: "10000002",
						description: "TomTom GPS",
						id: 9,
						parentFunctionalLocationId: 7,
						parentEquipmentId: 7,
						leaf: true,
						type: "EQUIPMENT"
					}, {
						name: "10000003",
						description: "Machine A",
						id: 15,
						parentFunctionalLocationId: 10,
						leaf: true,
						type: "EQUIPMENT"
					}, {
						name: "10000004",
						description: "Machine B",
						id: 15,
						parentFunctionalLocationId: 10,
						leaf: true,
						type: "EQUIPMENT"
					}, {
						name: "10000005",
						description: "Machine C",
						id: 15,
						parentFunctionalLocationId: 11,
						leaf: true,
						type: "EQUIPMENT"
					}, {
						name: "10000006",
						description: "Machine D",
						id: 15,
						parentFunctionalLocationId: 12,
						leaf: true,
						type: "EQUIPMENT"
					}
				]
			};

			this.structureData = new JSONModel(this.data);

			this.viewModel = this.data.FunctionalLocations.filter(function(fl) {
				return fl.parentId === "";
			});

			this.getView().setModel(new JSONModel({
				items: this.viewModel
			}), "viewModel");
		},

		onPressItem: function(oEvent) {
			var bindingContext = oEvent.getSource().getBindingContextPath();
			var item = this.getView().getModel("viewModel").getProperty(bindingContext);

			if (!item.expanded && !item.leaf) {
				var children = [];

				if (item.type === "FUNCTIONAL_LOCATION") {
					children = children.concat(this.getFunctionalLocationsByParent(item.id));
					children = children.concat(this.getEquipmentByParentFunctionalLocation(item.id));
				} else {
					children = children.concat(this.getEquipmentByParentEquipment(item.id));
				}

				var itemIndex = this.viewModel.findIndex(function(currentItem) {
					return currentItem.id === item.id;
				});

				if (item.parentId === "") {
					item.level = 0;
				}

				for (var i = 0; i < children.length; i++) {
					children[i].level = item.level + 1;
					this.viewModel.splice(itemIndex + 1, 0, children[i]);
				}

				item.expanded = true;
			} else {
				this.closeItem(item);
			}

			this.getView().getModel("viewModel").refresh();
		},

		getFunctionalLocationsByParent: function(parentId) {
			// Get functional locations that are decendants of functional location
			return this.data.FunctionalLocations.filter(function(fl) {
				return fl.parentId === parentId;
			});
		},

		getEquipmentByParentFunctionalLocation: function(parentId) {
			// Get equipment that are direct decendants of functional location (has no equipment id)
			return this.data.Equipment.filter(function(eq) {
				return eq.parentFunctionalLocationId === parentId && !eq.parentEquipmentId;
			});
		},

		getEquipmentByParentEquipment: function(parentId) {
			// Get equipment that are decendants of equipment
			return this.data.Equipment.filter(function(fl) {
				return fl.parentEquipmentId === parentId;
			});
		},

		closeItem: function(item) {
			var children = this.viewModel.filter(function(currentItem) {
				if (item.type==="FUNCTIONAL_LOCATION")
				{
				return currentItem.parentId === item.id || (currentItem.parentFunctionalLocationId === item.id && !currentItem.parentEquipmentId); 
				}
				else
				{
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
			var oBindingContext = oEvent.getSource().getBindingContext("ViewModel");

		/*	this.getView().getModel().createBindingContext(
				"/ObjectsSet(ObjectNo='IE000000000010000000',Orderid='4000180',Counter='1')/Equipments", null, {},
				function(result) {
					
					
				}
				, false);*/

if (this.getView().getModel("viewModel").getProperty(oEvent.getSource().getBindingContext("viewModel").getPath()).type === "EQUIPMENT")
{

			var objecContext = "/EquipmentsSet('" + this.getView().getModel("viewModel").getProperty(oEvent.getSource().getBindingContext("viewModel").getPath()).name + "')";
	
			
				var oRouter = this.getRouter();
		
				oRouter.navTo("equipmentDetails", {
					objectContext: objecContext.substr(1),
					
				}, false);
}
else
{
				var objecContext = "/FunctionalLocationsSet('" + this.getView().getModel("viewModel").getProperty(oEvent.getSource().getBindingContext("viewModel").getPath()).name + "')";
	
			
				var oRouter = this.getRouter();
		
				oRouter.navTo("functionalLocationDetails", {
					objectContext: objecContext.substr(1),
					
				}, false);
}
		
		},

		gotoEquipmentDetailsPage: function(data) {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("BlockNavigation", data);
		},
		
		onSelectBtnPress: function(oEvent){
			
		},
		
		EnableButtonVisbleCheck: function(str){
			if (str === "notificationCreate") {
				return true;
			} else {
				return false;
			}
		}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf com.twobm.mobileworkorder.components.structureBrowser.view.structureBrowser
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.twobm.mobileworkorder.components.structureBrowser.view.structureBrowser
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.twobm.mobileworkorder.components.structureBrowser.view.structureBrowser
		 */
		//	onExit: function() {
		//
		//	}

	});

});