sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/Fragment"
], function(Controller, Fragment) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.notificationDetails.NotesBlock", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		onInit: function() {
			this._showFormFragment("LongTextFragmentDisplay");

		},

		editLongText: function() {
			this.toggleButtonsAndView(true);
		},

		SaveLongText: function() {

			var notifNo = this.getView().getBindingContext().getObject().NotifNo;
			var that = this;

			var parameters = {
				success: function(oData, response) {

				},
				error: that.errorCallBackShowInPopUp
			};

			var dataUpdate = {
				LongText: this.getView().getBindingContext().getObject().LongText
			};

			var updatePath = "/NotificationSet(Orderid='" + notifNo + "')";

			this.getView().getModel().update(updatePath, dataUpdate, parameters);

			that.toggleButtonsAndView(false);
		},

		toggleButtonsAndView: function(bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("editButton").setVisible(!bEdit);
			oView.byId("saveButton").setVisible(bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "LongTextFragmentChange" : "LongTextFragmentDisplay");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.twobm.mobileworkorder.components.workOrderDetails.view.AttachmentsBlock
		 */
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

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "com.twobm.mobileworkorder.components.notificationDetails.fragments." +
				sFragmentName);

			return this._formFragments[sFragmentName] = oFormFragment;
		},

		_showFormFragment: function(sFragmentName) {
			var oPage = this.getView().byId("NotesLayoutId");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},
		
		isNotificationStatusNotCompleted: function(NotificationStatus){
			if(NotificationStatus === this.getI18nText("notificationStatusCompleted")){
				return false;
			}
			else{
				return true;
			}
			
		}

	});
});