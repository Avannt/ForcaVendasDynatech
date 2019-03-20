/*eslint-disable no-console, no-alert */
sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History"
], function(BaseController, jQuery, Controller, formatter) {
	"use strict";

	return BaseController.extend("testeui5.controller.produtoConsultas", {

		onInit: function() {
			// set explored app's demo model on this sample
			this.getRouter().getRoute("produtoConsultas").attachPatternMatched(this._onCreateModel, this);
		},

		_onCreateModel: function() {
			var that = this;
			var vetorTabPrecoAux = [];
			that.vetorTodosPrecos = [];
			
			this.byId("idTabelaPreco").setSelectedKey();
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "consultasProdutos");
									
			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				console.log(open.error.mensage);
			};

			open.onsuccess = function() {
				var db = open.result;

				var objectStore = db.transaction("A963", "readonly").objectStore("A963"); // Chave default
				if ("getAll" in objectStore) {
					objectStore.getAll().onsuccess = function(event) {
						var vetorTabPreco = [];
						vetorTabPreco = event.target.result;
						for (var i = 0; i < vetorTabPreco.length; i++) {
							if (vetorTabPreco[i].pltyp != "AM" && vetorTabPreco[i].pltyp != "BD" && vetorTabPreco[i].pltyp != "BO") {
								vetorTabPrecoAux.push(vetorTabPreco[i]);
							}
						}

						var oModel = new sap.ui.model.json.JSONModel(vetorTabPrecoAux);
						that.getView().setModel(oModel, "tabPreco");
					};
				}
			};
		},

		onNavBack: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("menuConsultas");
		},

		onPressDetailBack: function() {
			this.byId("list").removeSelections(true);
			this.getSplitContObj().backDetail();
		},

		onChangeTabelaPreco: function(oEvent) {
			var that = this;
			this.byId("tableProdutos").setBusy(true);
			var tabnorm = oEvent.getSource().getSelectedKey();
			var werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
			var tabbri = that.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabbri;
			var tabamo = that.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabamo;
			var tabbon = that.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabbon;

			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				console.log(open.error.mensage);
			};

			open.onsuccess = function() {
				var db = open.result;

				var promise = new Promise(function(resolve, reject) {
					//Busca o preço do item
					var objectStore = db.transaction("Materiais", "readonly").objectStore("Materiais"); // Chave default
					if ("getAll" in objectStore) {
						objectStore.getAll().onsuccess = function(event) {
							var vetorProdutos = [];
							vetorProdutos = event.target.result;
							resolve(vetorProdutos);
						};
					}
				});

				promise.then(function(vetorProdutos) {

					var itemPreco = [];
					var idA960 = "";
					var tabPreco = "";
					
					var storeA960 = db.transaction("A960", "readwrite");
					var objA960 = storeA960.objectStore("A960");
					var oA960 = objA960.index("pltyp");
					
					var requesA960 = oA960.getAll(tabnorm);

					requesA960.onsuccess = function(e) {
						that.vetorTodosPrecos = e.target.result;

						var requesA960BRI = oA960.getAll(tabbri);

						requesA960BRI.onsuccess = function(e) {
							var resultBRI = e.target.result;

							for (var o = 0; o < resultBRI.length; o++) {
								that.vetorTodosPrecos.push(resultBRI[o]);
							}

							var requesA960AMO = oA960.getAll(tabamo);

							requesA960AMO.onsuccess = function(e) {
								var resultAMO = e.target.result;

								for (var p = 0; p < resultAMO.length; p++) {
									that.vetorTodosPrecos.push(resultAMO[p]);
								}

								var requesA960BON = oA960.getAll(tabbon);

								requesA960BON.onsuccess = function(e) {
									var resultBON = e.target.result;
									
									for (var l = 0; l < resultBON.length; l++) {
										that.vetorTodosPrecos.push(resultBON[l]);
									}
									
									for (var i = 0; i < vetorProdutos.length; i++) {
										
										that.byId("tableProdutos").setBusy(true);
										
										for (var t = 0; t < that.vetorTodosPrecos.length; t++) {
											
											if (vetorProdutos[i].mtpos == "YBRI" && that.vetorTodosPrecos[t].pltyp == "BD" && vetorProdutos[i].matnr == that.vetorTodosPrecos[t].matnr) {
												vetorProdutos[i].zzVprod = that.vetorTodosPrecos[t].zzVprod;
												itemPreco.push(vetorProdutos[i]);
												break;
											} else if (vetorProdutos[i].mtpos == "YBON" && that.vetorTodosPrecos[t].pltyp == "BO" && vetorProdutos[i].matnr == that.vetorTodosPrecos[t].matnr) {
												vetorProdutos[i].zzVprod = that.vetorTodosPrecos[t].zzVprod;
												itemPreco.push(vetorProdutos[i]);
												break;
											} else if (vetorProdutos[i].mtpos == "YAMO" && that.vetorTodosPrecos[t].pltyp == "AM" && vetorProdutos[i].matnr == that.vetorTodosPrecos[t].matnr) {
												vetorProdutos[i].zzVprod = that.vetorTodosPrecos[t].zzVprod;
												itemPreco.push(vetorProdutos[i]);
												break;
											} else if (vetorProdutos[i].mtpos == "NORM" && that.vetorTodosPrecos[t].pltyp == tabnorm && vetorProdutos[i].matnr == that.vetorTodosPrecos[t].matnr) {
												vetorProdutos[i].zzVprod = that.vetorTodosPrecos[t].zzVprod;
												itemPreco.push(vetorProdutos[i]);
												break;
											}
										}
									}
									var oModel = new sap.ui.model.json.JSONModel(itemPreco);
									that.getView().setModel(oModel, "consultasProdutos");
									that.byId("tableProdutos").setBusy(false);
									
								};
							};
						};

					};
				});
			};
		},

		onSearch: function(oEvent) {

			var sValue = oEvent.getSource().getValue();
			var aFilters = [];
			var oFilter = [new sap.ui.model.Filter("matnr", sap.ui.model.FilterOperator.StartsWith, sValue),
				new sap.ui.model.Filter("maktx", sap.ui.model.FilterOperator.Contains, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("tableProdutos").getBinding("items").filter(aFilters, "Application");
		},

		onPressModeBtn: function(oEvent) {
			var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();

			this.getSplitContObj().setMode(sSplitAppMode);
		},

		getSplitContObj: function() {
			var result = this.byId("SplitContDemoProdutos");
			if (!result) {
				jQuery.sap.log.error("SplitApp object can't be found");
			}
			return result;
		}
	});
});