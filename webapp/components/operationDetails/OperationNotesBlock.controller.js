sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.operationDetails.OperationNotesBlock", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.operations.operationDetails.OperationNotesBlock
		 */
		onInit: function() {
			this._showFormFragment("LongTextFragmentDisplay");
		},

		onExit: function() {
			for (var sPropertyName in this._formFragments) {
				if (!this._formFragments.hasOwnProperty(sPropertyName)) {
					return;
				}

				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}
		},
		_formFragments: {},

		_getFormFragment: function(sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(),
				"com.twobm.mobileworkorder.components.operationDetails.fragments." +
				sFragmentName);

			return this._formFragments[sFragmentName] = oFormFragment;
		},

		_showFormFragment: function(sFragmentName) {
			var oPage = this.getView().byId("OperationNotesLayoutId");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.twobm.mobileworkorder.components.operations.operationDetails.OperationNotesBlock
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.twobm.mobileworkorder.components.operations.operationDetails.OperationNotesBlock
		 */
		//	onAfterRendering: function() {
		//
		//	},

	});

});