sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.operationDetails.blocks.OperationNotesBlock", {

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
	});
});