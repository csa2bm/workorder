sap.ui.define([], function() {
	"use strict";

	return {
		// geti18NResourceBundle: function() {
		// 	var bundleUrl = "i18n/messageBundle.properties";

		// 	var i18nModel = new sap.ui.model.resource.ResourceModel({
		// 		bundleUrl: bundleUrl
		// 	});

		// 	return i18nModel;
		// },

		geti18NText: function(bundle, key) {
			if (bundle) {
				return bundle.getText(key);
			} else {
				return null;
			}
		},

		geti18NText1: function(bundle, key, replace) {
			if (bundle) {
				var text = bundle.getText(key);
				if (text !== null) {
					var textWithReplacement = text.replace("{0}", replace);
					return textWithReplacement;
				}
			} else {
				return null;
			}
		},

		geti18NText2: function(bundle, key, replace1, replace2) {
			if (bundle) {
				var text = bundle.getText(key);
				if (text !== null) {
					var textWithReplacement = text.replace("{0}", replace1);
					textWithReplacement = textWithReplacement.replace("{1}", replace2);
					return textWithReplacement;
				}
			} else {
				return null;
			}
		},

		geti18NText3: function(bundle, key, replace1, replace2, replace3) {
			if (bundle) {
				var text = bundle.getText(key);
				if (text !== null) {
					var textWithReplacement = text.replace("{0}", replace1);
					textWithReplacement = textWithReplacement.replace("{1}", replace2);
					textWithReplacement = textWithReplacement.replace("{2}", replace3);
					return textWithReplacement;
				}
			} else {
				return null;
			}
		},

		geti18NText4: function(bundle, key, replace1, replace2, replace3, replace4) {
			if (bundle) {
				var text = bundle.getText(key);
				if (text !== null) {
					var textWithReplacement = text.replace("{0}", replace1);
					textWithReplacement = textWithReplacement.replace("{1}", replace2);
					textWithReplacement = textWithReplacement.replace("{2}", replace3);
					textWithReplacement = textWithReplacement.replace("{3}", replace4);
					return textWithReplacement;
				}
			} else {
				return null;
			}
		}
	};
});