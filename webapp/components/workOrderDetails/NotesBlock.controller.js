sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/Fragment"
], function(Controller, Fragment) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.NotesBlock", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.NotesBlock
		 */
			onInit: function() {
				this._showFormFragment("LongTextFragmentDisplay");
		
			},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.NotesBlock
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.
		 */
		onExit : function () {
			for(var sPropertyName in this._formFragments) {
				if(!this._formFragments.hasOwnProperty(sPropertyName)) {
					return;
				}
 
				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}
		},
		
		_formFragments: {},
		
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];
 
			if (oFormFragment) {
				return oFormFragment;
			}
 
			//oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "com.twobm.mobileworkorder.components.workOrderDetails.fragments." + sFragmentName);
			 oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "com.twobm.mobileworkorder.components.workOrderDetails.fragments.LongTextFragmentDisplay");
			return this._formFragments[sFragmentName] = oFormFragment;
		},
		
		_showFormFragment : function (sFragmentName) {
			var vLayout = this.getView().byId("layout1");
 
			//oPage.removeAllContent();
			var oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "com.twobm.mobileworkorder.components.workOrderDetails.fragments.LongTextFragmentDisplay");
			vLayout.insertContent(oFormFragment);
		}

	});
});