sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"com/twobm/mobileworkorder/util/Globalization"
], function(Controller, UIComponent, Globalization) {
	"use strict";

	return Controller.extend("com.2bm.mobileworkorder.util.Controller", {
		/**
		 * get the event bus of the applciation component
		 * @returns {Object} the event bus
		 */
		getEventBus: function() {
			return sap.ui.getCore().getEventBus();
		},

		/**
		 * get the UIComponent router
		 * @param{Object} this either a view or controller
		 * @returns {Object} the event bus
		 */
		getRouter: function() {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getI18nText: function(para) {
			return Globalization.geti18NText(para);
		},

		getI18nTextReplace1: function(para, replace1) {
			return Globalization.geti18NText1(para, replace1);
		},

		getI18nTextReplace2: function(para, replace1, replace2) {
			return Globalization.geti18NText2(para, replace1, replace2);
		},

		getI18nTextReplace3: function(para, replace1, replace2, replace3) {
			return Globalization.geti18NText3(para, replace1, replace2, replace3);
		},

		getI18nTextReplace4: function(para, replace1, replace2, replace3, replace4) {
			return Globalization.geti18NText4(para, replace1, replace2, replace3, replace4);
		},

		navBack: function(route, data) {

			var history = sap.ui.core.routing.History.getInstance();
			var previousHash = history.getPreviousHash();

			// The history contains a previous entry
			if (previousHash !== undefined) {
				window.history.go(-1);
			} else {
				var replace = true; // otherwise we go backwards with a forward history
				this.getRouter().navTo(route, data, replace);
			}
		},

		errorCallBackShowInPopUp: function(oError) {

			if (oError) {
				if (oError.responseText) {
					var errorCode = JSON.parse(oError.responseText).error.code;
					var errorMessage = JSON.parse(oError.responseText).error.message.value;

					sap.m.MessageBox.error("Error: " + errorCode + " - " + errorMessage);
				} else {
					sap.m.MessageBox.error("Error: " + oError.message);
				}
			}
		}
	});
});