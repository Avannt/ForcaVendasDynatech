sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"testeui5/model/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"

], function(BaseController, MessageBox, ExportTypeCSV, Export) {
	"use strict";

	var oProdutosTemplate = [];
	var oItemTabPrecoTemplate = [];
	var oItemContrato = [];
	var oProdutosTemplateGrid = [];
	var substItem = [];
	var filtroGrid = [];
	var oProdutosTemplateGridAux = [];
	return BaseController.extend("testeui5.controller.detalhesRelatorioTabelas", {

		onInit: function() {

			//FORÇA FAZER O INIT DA PÁGINA .. MESMO QUE JÁ FOI INICIADA.
			this.getRouter().getRoute("detalhesRelatorioTabelas").attachPatternMatched(this._onLoadFields, this);
		},

		_handleValueHelpSearch: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			var aFilters = [];
			var oFilter = [new sap.ui.model.Filter("ProdutoId", sap.ui.model.FilterOperator.Contains, sValue), new sap.ui.model.Filter(
				"Descricao", sap.ui.model.FilterOperator.Contains, sValue)];
			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("idProdutoRelatorio").getBinding("suggestionItems").filter(aFilters);
			this.byId("idProdutoRelatorio").suggest();
		},

		onItemChange: function(oEvent) {
			filtroGrid = [];
			var codItemSelecionado = oEvent.oSource.getValue();

			var oModel = new sap.ui.model.json.JSONModel(filtroGrid);
			this.getOwnerComponent().setModel(oModel, "relatorioTabelas");

			for (var i = 0; i < oProdutosTemplateGrid.length; i++) {
				if (codItemSelecionado == oProdutosTemplateGrid[i].ProdutoId) {
					filtroGrid.push(oProdutosTemplateGrid[i]);
				}
			}
			if (codItemSelecionado == "") {
				oModel = new sap.ui.model.json.JSONModel(oProdutosTemplateGridAux);
				this.getOwnerComponent().setModel(oModel, "relatorioTabelas");

			} else {
				oModel = new sap.ui.model.json.JSONModel(filtroGrid);
				this.getOwnerComponent().setModel(oModel, "relatorioTabelas");

			}
		},

		_onLoadFields: function() {
			var that = this;
			oProdutosTemplate = "";
			oItemTabPrecoTemplate = "";
			oItemContrato = "";
			oProdutosTemplateGrid = "";
			substItem = "";
			filtroGrid = "";
			oProdutosTemplateGridAux = "";
			this.byId("idtablePrecos").setGrowingTriggerText("Próximo >>>");
	
			oProdutosTemplate = [];
			oItemTabPrecoTemplate = [];
			oItemContrato = [];
			oProdutosTemplateGrid = [];
			substItem = [];
			filtroGrid = [];
			oProdutosTemplateGridAux = [];
			
			var possueContrato = false;
			that.byId("idtablePrecos").setBusy(true);

			var cliente = this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/cliente");
			var estabelecimento = this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/estabelecimento");
			var origEstabel = that.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/origEstabel");

			var oModel = new sap.ui.model.json.JSONModel(oProdutosTemplateGridAux);
			this.getOwnerComponent().setModel(oModel, "produtoRenatorio");

			oModel = new sap.ui.model.json.JSONModel(oProdutosTemplateGrid);
			this.getOwnerComponent().setModel(oModel, "relatorioTabelas");

			var open1 = indexedDB.open("Dyna_DataBase");

			open1.onerror = function() {
				MessageBox.show(open1.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open1.onsuccess = function() {
				var db = open1.result;
				var IdBase = that.getOwnerComponent().getModel("modelAux").getProperty("/IdBase");

				//CARREGA OS PRODUTOS DO FRAGMENTO 
				var store = db.transaction("Produtos", "readwrite").objectStore("Produtos");
				store.openCursor().onsuccess = function(event) {
					// consulta resultado do event
					var cursor = event.target.result;
					if (cursor) {
						if (cursor.value.IdBase == IdBase) {
							oProdutosTemplate.push(cursor.value);
						}

						cursor.continue();
					} else {
						oModel = new sap.ui.model.json.JSONModel(oProdutosTemplate);
						that.getView().setModel(oModel, "produtosRelatorio");

						var store = db.transaction("Clientes").objectStore("Clientes");
						store.openCursor().onsuccess = function(event) {
							var cursor = event.target.result;
							if (cursor) {
								if (cursor.value.IdBase == IdBase && cursor.value.CodCliente == cliente) {
									var orig = cursor.value.Estado;
									that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/origCliente", orig);

								}

								cursor.continue();
							} else {
								var origCliente = that.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/origCliente");

								var objExtItemUf = db.transaction("ExtItemUf").objectStore("ExtItemUf");
								objExtItemUf.openCursor().onsuccess = function(event4) {

									var cursor4 = event4.target.result;

									if (cursor4) {
										if (cursor4.value.EstadoDest == origCliente && cursor4.value.EstadoOrig == origEstabel &&
											cursor4.value.CodEstabel == estabelecimento && cursor4.value.IdBase == IdBase) {
											substItem.push(cursor4.value);
										}
										cursor4.continue();
									} else {
										//CHECA SE O CLIENTE POSSUI CONTRATO DE  VENCIMENTO - se possuir .. prevalecer esses dados
										store = db.transaction("ContratoCliente").objectStore("ContratoCliente");
										store.openCursor().onsuccess = function(event) {
											var cursor1 = event.target.result;
											if (cursor1) {
												if (cursor1.value.CodCliente == cliente && cursor1.value.CodEstabel == estabelecimento && cursor1.value.IdBase ==
													IdBase) {
													oItemContrato.push(cursor1.value);

												}
												cursor1.continue();
											} else {
												var objItemTabPreco = db.transaction("ItemTabPreco").objectStore("ItemTabPreco");
												objItemTabPreco.openCursor().onsuccess = function(event3) {

													var cursor3 = event3.target.result;
													var numeroTabelaPreco = that.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/tabelaPreco");
													if (cursor3) {
														if (cursor3.value.NrTabPreco == numeroTabelaPreco && cursor3.value.IdBase == IdBase) {
															oItemTabPrecoTemplate.push(cursor3.value);
														}
														cursor3.continue();
													} else {
														var canal = that.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/canal");
														var indice = parseFloat(that.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/indice"));
														var indice2 = 0;

														oProdutosTemplateGrid = oProdutosTemplate;

														for (var l = 0; l < oProdutosTemplateGrid.length; l++) {
															oProdutosTemplateGrid[l].PrecoSubstituicao = 0;
															for (var m = 0; m < substItem.length; m++) {
																if (oProdutosTemplateGrid[l].ProdutoId == substItem[m].ItCodigo) {
																	oProdutosTemplateGrid[l].PctSubTrib = parseFloat(substItem[m].PctSubTrib);
																}
															}
														}

														//PERCORRE O VETOR CENTRAL E ADICIONA PERC CONTRATO NELE DE ACORDO COM A UNIDADE DE NEGOCIO
														for (var k = 0; k < oProdutosTemplateGrid.length; k++) {
															oProdutosTemplateGrid[k].PctDescContrato = 0;
															for (var p = 0; p < oItemContrato.length; p++) {
																if (oProdutosTemplateGrid[k].CodUnidNegoc == oItemContrato[p].CodUnidNegoc) {
																	oProdutosTemplateGrid[k].PctDescContrato = oItemContrato[p].PctDescContrato;
																}
															}
														}
														//PERCORRE VETOR CENTRAL ADICIONANDO CANAL / PROMOÇÃO E PREÇO DE VENDA .
														for (var i = 0; i < oProdutosTemplateGrid.length; i++) {
															oProdutosTemplateGrid[i].Canal = parseFloat(canal);
															for (var j = 0; j < oItemTabPrecoTemplate.length; j++) {
																if (oProdutosTemplateGrid[i].ProdutoId == oItemTabPrecoTemplate[j].ItCodigo) {
																	oProdutosTemplateGrid[i].PrecoVenda = Math.round(parseFloat(oItemTabPrecoTemplate[j].PrecoVenda) * 100) / 100;
																	oProdutosTemplateGrid[i].PctDescPromo = parseFloat(oItemTabPrecoTemplate[j].PctDescPromo);
																}
															}
															if (oProdutosTemplateGrid[i].PrecoVenda == undefined) {
																oProdutosTemplateGrid[i].PrecoVenda = 0;
																indice2 = 0;
															} else {
																indice2 = indice;
															}

															oProdutosTemplateGrid[i].PrecoTabela = oProdutosTemplateGrid[i].PrecoVenda;
															oProdutosTemplateGrid[i].PrecoVenda = oProdutosTemplateGrid[i].PrecoTabela + Math.round(parseFloat(parseFloat(
																indice2) * oProdutosTemplateGrid[i].PrecoTabela / 100) * 100) / 100;

															if (oProdutosTemplateGrid[i].PctDescContrato > 0) {
																if (oProdutosTemplateGrid[i].PctDescContrato < oProdutosTemplateGrid[i].Canal) {
																	oProdutosTemplateGrid[i].Canal = oProdutosTemplateGrid[i].Canal - oProdutosTemplateGrid[i].PctDescContrato;

																} else {
																	oProdutosTemplateGrid[i].PrecoVenda = oProdutosTemplateGrid[i].PrecoVenda + parseFloat(((oProdutosTemplateGrid[
																		i].PrecoVenda * (oProdutosTemplateGrid[i].PctDescContrato - oProdutosTemplateGrid[i].Canal)) / 100));
																	oProdutosTemplateGrid[i].Canal = 0;
																}
															}

															oProdutosTemplateGrid[i].PrecoLiq = oProdutosTemplateGrid[i].PrecoVenda;
															oProdutosTemplateGrid[i].PrecoLiq -= Math.round(parseFloat((oProdutosTemplateGrid[i].Canal *
																oProdutosTemplateGrid[i].PrecoLiq) / 100) * 10000000000) / 10000000000;
															oProdutosTemplateGrid[i].PrecoLiq -= Math.round(parseFloat((oProdutosTemplateGrid[i].PctDescPromo *
																oProdutosTemplateGrid[i].PrecoLiq) / 100) * 100) / 100;
															oProdutosTemplateGrid[i].PrecoVenda = Math.round(parseFloat(oProdutosTemplateGrid[i].PrecoVenda) * 100) / 100;
															oProdutosTemplateGrid[i].PrecoLiq = Math.round(parseFloat(oProdutosTemplateGrid[i].PrecoLiq) * 100) / 100;
															oProdutosTemplateGrid[i].PrecoSubstituicao = oProdutosTemplateGrid[i].PrecoLiq + Math.round(parseFloat((
																oProdutosTemplateGrid[i].PrecoLiq * oProdutosTemplateGrid[i].PctSubTrib) / 100) * 100) / 100;
															oProdutosTemplateGrid[i].PrecoSubstituicao = Math.round(parseFloat(oProdutosTemplateGrid[i].PrecoSubstituicao) *
																100) / 100;

															// var precoVenda = oProdutosTemplateGrid[i].PrecoVenda;
															// var precoLiq = oProdutosTemplateGrid[i].PrecoLiq;
															// var precoSubs = oProdutosTemplateGrid[i].PrecoSubstituicao;

														}

														var exibicao = that.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/exibicao");
														for (var t = 0; t < oProdutosTemplateGrid.length; t++) {
																if (exibicao == 2) {
																	oProdutosTemplateGrid[t].PrecoVenda = Math.round(parseFloat(oProdutosTemplateGrid[t].PrecoVenda /
																		oProdutosTemplateGrid[t].QtCaixa) * 100) / 100;
																	oProdutosTemplateGrid[t].PrecoLiq = Math.round(parseFloat(oProdutosTemplateGrid[t].PrecoLiq /
																		oProdutosTemplateGrid[t].QtCaixa) * 100) / 100;
																	oProdutosTemplateGrid[t].PrecoSubstituicao = Math.round(parseFloat(oProdutosTemplateGrid[t].PrecoSubstituicao /
																		oProdutosTemplateGrid[t].QtCaixa) * 100) / 100;
																}
															}
														
														
														for(var q=0; q<oProdutosTemplateGrid.length;q++){
															if (oProdutosTemplateGrid[q].PrecoVenda != 0) {
																oProdutosTemplateGridAux.push(oProdutosTemplateGrid[q]);
															}
														}

														oModel = new sap.ui.model.json.JSONModel(oProdutosTemplateGridAux);
														that.getOwnerComponent().setModel(oModel, "relatorioTabelas");
														that.byId("idtablePrecos").setBusy(false);

													}
												};
											}
										};
									}
								};
							}
						};
					}
				};
			};
		}
	});
});