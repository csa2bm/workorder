sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/routing/History",
	"com/twobm/mobileworkorder/util/Formatter",
	"com/twobm/mobileworkorder/dev/devapp",
	"com/twobm/mobileworkorder/util/SyncStateHandler"
], function(Controller, History, Formatter, devApp, SyncStateHandler) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.settings.Settings", {
		formatter: Formatter,

		onResetClient : function()
		{
			alert("test");
		}

	});
});