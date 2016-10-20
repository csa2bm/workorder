sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"sap/ui/core/Fragment"
], function(Controller, Fragment) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.blocks.NotesBlock", {
		onInit: function() {
			//Subscribe to events
			var eventBus = this.getEventBus();
			eventBus.subscribe("longTextDisplayMode", this.setLongTextInDisplayMode, this);
			this._showFormFragment("LongTextFragmentDisplay");

			//setup edit note model
			var editNoteModel = this.getView().getModel("EditNoteModel");
			editNoteModel = new sap.ui.model.json.JSONModel();
			editNoteModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			this.getView().setModel(editNoteModel, "EditNoteModel");
			
			this.clearEditNoteModel();
		},

		clearEditNoteModel: function() {
			var editNoteModel = this.getView().getModel("EditNoteModel");

			var data = {
				Editable: false
			};

			editNoteModel.setData(data);
		},

		editLongText: function() {
			this.toggleButtonsAndView(true);
		},

		SaveLongText: function() {
			var orderNo = this.getView().getBindingContext().getObject().Orderid;
			var that = this;

			var parameters = {
				success: function(oData, response) {
				},
				error: that.errorCallBackShowInPopUp
			};

			var dataUpdate = {
				LongText: this.getView().getBindingContext().getObject().LongText
			};

			var updatePath = "/OrderSet(Orderid='" + orderNo + "')";

			this.getView().getModel().update(updatePath, dataUpdate, parameters);

			that.toggleButtonsAndView(false);
		},

		toggleButtonsAndView: function(bEdit) {
			var editNoteModel = this.getView().getModel("EditNoteModel");
			editNoteModel.getData().Editable = bEdit;
			editNoteModel.refresh();

			// Set the right form type
			this._showFormFragment(bEdit ? "LongTextFragmentChange" : "LongTextFragmentDisplay");
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

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "com.twobm.mobileworkorder.components.workOrderDetails.fragments." +
				sFragmentName);

			return this._formFragments[sFragmentName] = oFormFragment;
		},

		_showFormFragment: function(sFragmentName) {
			var oPage = this.getView().byId("NotesLayoutId");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},
		
		orderStatusValid: function(str) {

			var oContext = this.getView().getBindingContext();
			var model = this.getView().getModel();

			return !this.readOnly(oContext, model);
		},
		
		setLongTextInDisplayMode: function() {
			this._showFormFragment("LongTextFragmentDisplay");
			this.toggleButtonsAndView(false);
		},
		
		getNotEditableNote : function (editable){
			return !editable;
		}
	});
});