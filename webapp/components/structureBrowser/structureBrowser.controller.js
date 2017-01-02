sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.structureBrowser.structureBrowser", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.structureBrowser.view.structureBrowser
		 */
			onInit: function() {
				// Create demo data
				this.createDemoData();
			},
			
			createDemoData : function()
			{
				this.data = {
					FunctionalLocations: [
				{
						name : "F1",
						id: 1,
						parentId: "",
						leaf : false,
						type: "FUNCTIONAL_LOCATION"
					},
					{
						name : "F2",
						id: 2,
						parentId: "",
						leaf : true,
						type: "FUNCTIONAL_LOCATION"
					},
					{
						name : "F3",
						id: 3,
						parentId: "",
						leaf : true,
						type: "FUNCTIONAL_LOCATION"
					},
						{
						name : "F1-1",
						id: 4,
						parentId: 1,
						leaf : true,
						type: "FUNCTIONAL_LOCATION"
					},
					{
						name : "F1-2",
						id: 5,
						parentId: 1,
						leaf : false,
						type: "FUNCTIONAL_LOCATION"
					},
					{
						name : "F1-3",
						id: 6,
						parentId: 1,
						leaf : true,
						type: "FUNCTIONAL_LOCATION"
					},
						{
						name : "F1-2-1",
						id: 7,
						parentId: 5,
						leaf : true,
						type: "EQUIPMENT"
					},
					{
						name : "F1-2-2",
						id: 8,
						parentId: 5,
						leaf : true,
						type: "EQUIPMENT"
					}
					]
				};
				
				this.structureData = new JSONModel(this.data);
				
				this.viewModel = this.data.FunctionalLocations.filter(function(fl){ return fl.parentId == "";});
				
				this.getView().setModel(new JSONModel({items : this.viewModel}), "viewModel");
			},
			
			onPressItem : function(oEvent)
			{
				var bindingContext = oEvent.getSource().getBindingContextPath();
				var item = this.getView().getModel("viewModel").getProperty(bindingContext);
			
				if (!item.expanded && !item.leaf) 	
				{
				var children = this.data.FunctionalLocations.filter(function(fl){ return fl.parentId == item.id;});
				
				var itemIndex = this.viewModel.findIndex(function(currentItem){ return currentItem.id === item.id;});
				
				if (item.parentId === "")
				{
					item.level = 0;		
				}
				
				for (var i = 0; i < children.length; i++)
				{
					children[i].level = item.level + 1;
					this.viewModel.splice(itemIndex + 1, 0, children[i]);
				}
				
				item.expanded = true;
				}
				else
				{
					this.closeItem(item);
				}
				
				this.getView().getModel("viewModel").refresh();
			},
			
			closeItem : function(item)
			{
				var children = this.viewModel.filter(function(currentItem){ return currentItem.parentId === item.id;});
				for (var i = 0; i < children.length; i ++)
				{
					this.closeItem(children[i]);
					var itemIndex = this.viewModel.findIndex(function(currentItem){ return currentItem.id === children[i].id;});
					this.viewModel.splice(itemIndex, 1);
					item.expanded = false;
				}
			},
			
			isLeaf : function(isLeaf, expanded)
			{
				if (expanded)
				{
					return "sap-icon://navigation-down-arrow";
				}
				else if (!isLeaf)
				{
					return "sap-icon://navigation-right-arrow";
				}
					
				return "";
			},
			
			typeIcon : function(type)
			{
				if (type === "FUNCTIONAL_LOCATION")
				{
					return "sap-icon://functional-location";
				}
	
				return "sap-icon://wrench";

			},
			
			indentForLevel : function(level, text)
			{
				for (var i = 0; i < level; i++)
				{
					text = "\u00a0\u00a0\u00a0\u00a0\u00a0" + text;
				}
				
				return text;
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