jQuery.sap.declare("com.twobm.mobileworkorder.util.Globalization");

com.twobm.mobileworkorder.util.Globalization = {

	geti18NResourceBundle: function() {
		var bundleUrl = "i18n/i18n.properties";

		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: bundleUrl
		});
	
		return i18nModel;
	},

	geti18NText: function(key) {
		if (this.geti18NResourceBundle()) {
			return this.geti18NResourceBundle().getProperty(key);
		} else {
			return null;
		}
	},

	geti18NText1: function(key, replace) {
		if (this.geti18NResourceBundle()) {
			var text = this.geti18NResourceBundle().getProperty(key);
			if (text !== null) {
				var textWithReplacement = text.replace("{0}", replace);
				return textWithReplacement;
			}
		} else {
			return null;
		}
	},

	geti18NText2: function(key, replace1, replace2) {
		if (this.geti18NResourceBundle()) {
			var text = this.geti18NResourceBundle().getProperty(key);
			if (text !== null) {
				var textWithReplacement = text.replace("{0}", replace1);
				textWithReplacement = text.replace("{1}", replace2);
				return textWithReplacement;
			}
		} else {
			return null;
		}
	},

	geti18NText3: function(key, replace1, replace2, replace3) {
		if (this.geti18NResourceBundle()) {
			var text = this.geti18NResourceBundle().getProperty(key);
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
	
	geti18NText4: function(key, replace1, replace2, replace3, replace4) {
		if (this.geti18NResourceBundle()) {
			var text = this.geti18NResourceBundle().getProperty(key);
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