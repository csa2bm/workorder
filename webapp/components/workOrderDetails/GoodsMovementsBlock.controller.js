sap.ui.define([
	"com/twobm/mobileworkorder/util/Controller",
	"com/twobm/mobileworkorder/util/Formatter",
	"sap/m/MessageBox",
	"sap/ui/core/ValueState"
], function(Controller, Formatter, MessageBox, ValueState) {
	"use strict";

	return Controller.extend("com.twobm.mobileworkorder.components.workOrderDetails.GoodsMovementsBlock", {

		onInit: function() {
			this.createMaterialDetailsModel();

			this.createMaterialSelectionPopover();
		},

		createMaterialDetailsModel: function() {

			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");

			if (!materialDetailsModel) {
				materialDetailsModel = new sap.ui.model.json.JSONModel();
				materialDetailsModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				this.getView().setModel(materialDetailsModel, "MaterialDetailsModel");
			}

			this.clearMaterialDetailsModel();
		},

		clearMaterialDetailsModel: function() {

			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");

			//Clear data
			var data = {
				SearchString: "",
				SearchResult: {
					//Fields from search result
					MaterialNumber: "",
					MaterialDescription: "",
					LocalStock: "",
					Unit: "",
					ImagePath: ""
				},
				OrderNumber: materialDetailsModel.getData().OrderNumber, //Do not clear this. Has to be kept between searches
				PreviousQuantity: "0",
				SelectedQuantity: "0",
				LocalDbObject: false,
				LocalDbObjectUri: ""
			};

			materialDetailsModel.setData(data);
		},

		createMaterialSelectionPopover: function() {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("MaterialSelectPopUp",
					"com.twobm.mobileworkorder.components.workOrderDetails.fragments.AddMaterialView", this);

				this._oPopover.setModel(this.getView().getModel());
				//this._oPopover.setModel(this.getView().getModel("device"), "device");

				//this._oPopover.attachAfterOpen(this.resizePopup);

				this._oPopover.attachBeforeClose(function() {
					//Just make sure that the control minimized
					//sap.ui.getCore().byId("popupImageControl").setWidth(null);
				});

				this.getView().addDependent(this._oPopover);
			}
		},

		onProductSelected: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oNavCon = sap.ui.core.Fragment.byId("MaterialSelectPopUp", "navCon");
			var oDetailPage = sap.ui.core.Fragment.byId("MaterialSelectPopUp", "detail");
			oNavCon.to(oDetailPage);
			oDetailPage.bindElement(oCtx.getPath());
		},

		//Called as a result of selecting material from select dialog
		setMaterialOnDialogSelect: function(oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");

			this.clearMaterialDetailsModel();

			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");

			materialDetailsModel.getData().SearchString = selectedItem.data("ID");
			materialDetailsModel.refresh();

			this.searchForMaterial();
		},

		searchMaterial: function(oEvent) {
			var sValue = oEvent.getParameter("query");
			var aFilters = [];

			var searchString = sValue.toLowerCase();

			var firstCharacterIsStar = (searchString.charAt(0) === "*");
			var lastCharacterIsStar = (searchString.charAt(searchString.length - 1) === "*");

			var searchStringSplitByStar = searchString.split("*");
			//Remoce all empty strings in array
			for (var i = searchStringSplitByStar.length - 1; i >= 0; i--) {
				if (searchStringSplitByStar[i] === "") {
					searchStringSplitByStar.splice(i, 1);
				}
			}

			//Logic for creating filters equal to standard SP search with *
			for (var i = 0; i < searchStringSplitByStar.length; i++) {
				var item = searchStringSplitByStar[i];

				if (item !== "") {
					if (i === 0) {
						//First character
						if (firstCharacterIsStar) {
							aFilters.push(new sap.ui.model.Filter("Matstring", sap.ui.model.FilterOperator.Contains, item));
						} else {
							if (searchStringSplitByStar.length === 1 && !lastCharacterIsStar) {
								aFilters.push(new sap.ui.model.Filter("Matstring", sap.ui.model.FilterOperator.EQ, item));
							} else {
								aFilters.push(new sap.ui.model.Filter("Matstring", sap.ui.model.FilterOperator.StartsWith, item));
							}
						}
					} else if (i === searchStringSplitByStar.length - 1) {
						//Last character
						if (lastCharacterIsStar) {
							aFilters.push(new sap.ui.model.Filter("Matstring", sap.ui.model.FilterOperator.Contains, item));
						} else {
							aFilters.push(new sap.ui.model.Filter("Matstring", sap.ui.model.FilterOperator.EndsWith, item));
						}
					} else {
						aFilters.push(new sap.ui.model.Filter("Matstring", sap.ui.model.FilterOperator.Contains, item));
					}
				}
			}

			var itemsBinding = oEvent.getParameter("itemsBinding");

			if (itemsBinding) {
				itemsBinding.aApplicationFilters = [];

				if (aFilters.length > 0) {

					var filter = new sap.ui.model.Filter({
						filters: aFilters,
						and: true

					});

					itemsBinding.filter(filter);
				} else {
					itemsBinding.filter(aFilters);
				}
			}
		},

		onNavBack: function(oEvent) {
			var oNavCon = sap.ui.core.Fragment.byId("MaterialSelectPopUp", "navCon");
			oNavCon.back();
		},

		addMaterial: function(oEvent) {
			this._oPopover.open();
		},

		scanBarcode: function(oEvent) {
			self = this;

			var orderNr = oEvent.getSource().getBindingContext().getObject().OrderNo;

			cordova.plugins.barcodeScanner.scan(
				function(result) {

					if (result.cancelled === "true") {
						return;
					}

					var barcodeScanned = this.getMaterialNrFromBarcode(result.text);

					var data = {
						"block": "material",
						"ordernr": orderNr,
						"matnr": barcodeScanned
					};

					self.gotoMaterialDetailPage(data);
				},
				function() {
					sap.m.MessageToast.show("Scanning failed");
				}
			);
		},

		getMaterialNrFromBarcode: function(barcode) {
			//Remove leading 99
			var barcodeStripped = barcode.substring(2);

			//Remove leading zeros
			while (barcodeStripped.charAt(0) === '0') {
				barcodeStripped = barcodeStripped.substr(1);
			}

			return barcodeStripped;
		},

		closeAddMaterial: function() {
			this._oPopover.close();
		},

		issueMaterial: function(oEvent) {

			if (!this.onValidate(this.getView())) {
				sap.m.MessageToast.show("Save not possible. Invalid input fields");
				return;
			}

			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");

			var matnr = materialDetailsModel.getData().SearchResult.MaterialNumber;
			var description = materialDetailsModel.getData().SearchResult.MaterialDescription;
			var unit = materialDetailsModel.getData().SearchResult.Unit;
			var quantity = Number(materialDetailsModel.getData().SelectedQuantity);
			var discount = materialDetailsModel.getData().CustomerDiscount;
			var ordernr = materialDetailsModel.getData().OrderNumber;

			var that = this;

			var previouslyIssuedQuantity = Number(materialDetailsModel.getData().PreviousQuantity);

			if (previouslyIssuedQuantity === quantity) {
				sap.m.MessageBox.error(this.getI18nTextReplace4("MaterialQuantityAlreadyRegistered", quantity, materialDetailsModel.getData().SearchResult
					.Unit, matnr, ordernr));
				return;
			}

			//Calculate the quantity to issue
			var valueToIssue = this.getIssueValue(quantity, previouslyIssuedQuantity);

			//Determine whether this is an issue of return of quantity
			var returnValue = this.getReturnValue(quantity, previouslyIssuedQuantity);

			// Create material on order
			var parameters = {
				success: function(oData, response) {
					that.updateDiscountInInternalComment(ordernr, matnr, discount);

					//If running in cordova we are using offlinestore and then
					//we need to make sure that we update correctly in local db if offline
					if (window.cordova) {
						that.updateLocalStorageStock(matnr, quantity, previouslyIssuedQuantity);
						that.updateMaterialSummary(ordernr, matnr, unit, description, valueToIssue, returnValue);
					}

					that.onNavBack();
				},
				error: this.errorCallBackShowInPopUp
			};

			var data = {
				OrderNo: ordernr,
				Matnr: matnr,
				Quantity: valueToIssue.toString(),
				Type: this.getMaterialDocumentStateText(returnValue),
				Description: description,
				Unit: unit,
				Return: returnValue
			};

			var sPath = "/OrderSet(OrderNo='" + ordernr + "')/Materials";

			var localStorageStock = Number(materialDetailsModel.getData().SearchResult.LocalStock);

			if (!returnValue) { // this is an issue of quantity
				// Check if quantity is available in local stock
				if (localStorageStock < valueToIssue) {
					sap.m.MessageBox.error(this.getI18nText("MaterialQuantityNotInLocalStorage"));
					return;
				}
			}

			this.getView().getModel().create(sPath, data, parameters);
		},

		getMaterialDocumentStateText: function(returnValue) {
			if (returnValue) {
				return this.getI18nText("materialDocumentStateCancelled");
			} else {
				return this.getI18nText("materialDocumentStateCreated");
			}
		},

		/*  Update local Quantity ( relevant in case user is offline and using offline store
		    in order to keep track of the remaining stock when goods issuing offline)
		*/
		updateLocalStorageStock: function(matnr, quantity, previouslyIssuedQuantity) {
			var parameters = {
				success: function(oData, response) {
					//console.log("Quantity local updated: " + response);
					//	console.log(oData);
				},
				error: this.errorCallBackShowInPopUp
			};

			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");
			var localStorageStock = Number(materialDetailsModel.getData().SearchResult.LocalStock);

			//Calculate the quantity to issue
			var valueToIssue = this.getIssueValue(quantity, previouslyIssuedQuantity);

			//Determine whether this is an issue of return of quantity
			var returnValue = this.getReturnValue(quantity, previouslyIssuedQuantity);

			var newStock;
			if (returnValue) {
				newStock = Number(localStorageStock + valueToIssue);
			} else {
				newStock = Number(localStorageStock - valueToIssue);
			}
			var matData = {
				Quantity: newStock.toString()
			};

			if (newStock >= 0) {
				this.getView().getModel().update("/MaterialsSet(Matnr='" + matnr + "')", matData, parameters);
			}

		},

		/*  This method is necessary when offline, in order to maintain the correct summarized 
		    value of the issued material in the material  summary entity.
		    Posts to MaterialSummaary is ignored on the online odata service.
		    In the online service the MaterialSummary is calculated on behalf of the material documents
		    (WorkOrderMaterials)
		 */
		updateMaterialSummary: function(ordernr, matnr, unit, description, valueToIssue, returnValue) {
			//Get the material from MaterialSummary
			//If existing, update quantity
			//If not, create material with quantity

			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");

			var parameters = {
				success: function(oData, response) {

				},
				error: this.errorCallBackShowInPopUp
			};

			var sPath;
			if (materialDetailsModel.getData().LocalDbObject) {
				sPath = materialDetailsModel.getData().LocalDbObjectUri;
			} else {
				sPath = "/MaterialsSummarySet(Matnr='" + matnr + "',OrderNo='" + ordernr + "')";
			}

			var materialSummary = this.getView().getModel().getProperty(sPath);

			var data;

			if (materialSummary) {
				//There already exist a material summary for the material on the order
				//update the summary
				var newQuantity;

				if (returnValue) {
					newQuantity = Number(materialSummary.Quantity) - valueToIssue;

				} else {
					newQuantity = Number(materialSummary.Quantity) + valueToIssue;
				}

				data = {
					Quantity: newQuantity.toString()
				};

				this.getView().getModel().update(sPath, data, parameters);

			} else {
				//Material has not previously been issued on the order
				//Create the summary
				data = {
					OrderNo: ordernr,
					Quantity: valueToIssue.toString(),
					Description: description,
					Unit: unit,
					Matnr: matnr
				};

				var createPath;

				if (window.sap_webide_FacadePreview) {
					createPath = "/OrderSet('" + ordernr + "')/MaterialsSummarySet";
				} else {
					createPath = "/OrderSet(OrderNo='" + ordernr + "')/MaterialsSummarySet";
				}

				this.getView().getModel().create(createPath, data, parameters);
			}
		},

		getReturnValue: function(newQuantity, previousQuantity) {
			var difference = newQuantity - previousQuantity;

			if (difference >= 0) {
				return false; // Material is used in order
			} else {
				return true; // Material is returned from order
			}
		},

		getIssueValue: function(newQuantity, previousQuantity) {
			var difference = newQuantity - previousQuantity;

			if (difference === 0) {
				return newQuantity;
			} else if (difference > 0) {
				return difference;
			} else {
				return -difference;
			}
		},

		increaseMaterialToOrder: function() {
			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");
			var oldValue = materialDetailsModel.getData().SelectedQuantity;
			var newValue = Number(oldValue) + 1;
			materialDetailsModel.getData().SelectedQuantity = newValue;
			materialDetailsModel.refresh();
			this.recalculateTotal();
		},

		decreaseMaterialToOrder: function() {
			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");
			var oldValue = materialDetailsModel.getData().SelectedQuantity;
			var newValue = Number(oldValue) - 1;

			//make sure that we cannot decrease to negative number
			if (newValue < 0) {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				sap.m.MessageBox.show(this.getI18nText("MaterialQuantityCannotBeNagative"), {
					icon: MessageBox.Icon.INFORMATION,
					title: "Quantity negative",
					actions: [MessageBox.Action.OK],
					defaultAction: MessageBox.Action.OK,
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				});
				return;
			}

			materialDetailsModel.getData().SelectedQuantity = newValue;
			materialDetailsModel.refresh();
			this.recalculateTotal();
		},

		recalculateTotal: function() {
			//  this.onValidate("materialsPage");
			this.getView().byId("inpQuantity").setValueState(ValueState.None);

			var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");
			var newValue = this.getView().byId("inpQuantity")._lastValue;
			if ("e".indexOf(newValue) > -1) {
				this.getView().byId("inpQuantity").setValue(0);
				return;
			} // parseInt(materialDetailsModel.getData().SelectedQuantity);
			if (newValue < 0 || (newValue > 0 && newValue < 1)) {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				sap.m.MessageBox.show(this.getI18nText("MaterialQuantityCannotBeNagative"), {
					icon: MessageBox.Icon.INFORMATION,
					title: "Quantity negative",
					actions: [MessageBox.Action.OK],
					defaultAction: MessageBox.Action.OK,
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				});
				materialDetailsModel.getData().SelectedQuantity = 0;
				this.getView().byId("inpQuantity").setValueState(ValueState.Error);
				return;
			}

			//var materialDetailsModel = this.getView().getModel("MaterialDetailsModel");
			var newPrice = Number(materialDetailsModel.getData().SelectedQuantity) * Number(materialDetailsModel.getData().CalculatedCustomerPrice);
			newPrice = Math.round((newPrice + 0.00001) * 100) / 100;
			materialDetailsModel.getData().CalculatedTotalPrice = newPrice;
			materialDetailsModel.refresh();
		}
	});

});