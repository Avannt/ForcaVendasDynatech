sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"testeui5/model/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"

], function(BaseController, MessageBox, ExportTypeCSV, Export) {
	"use strict";
	var oTabelasRelatorio = [];
	var oItemLoadVencimento = [];
	var oItemLoadVencimento2 = [];
	var oItemLoadVencimento3 = [];
	var oItemLoadEstabelecimento = [];
	var oItemVencimentoContrato = [];
	var oItemVencimentoContrato2 = [];
	var oItemVencimentoContrato3 = [];
	var indice1 = 0;
	var indice2 = 0;
	var indice3 = 0;
	return BaseController.extend("testeui5.controller.relatorioTabelas", {

		onInit: function() {

			//FORÇA FAZER O INIT DA PÁGINA .. MESMO QUE JÁ FOI INICIADA.
			this.getRouter().getRoute("relatorioTabelas").attachPatternMatched(this._onLoadFields, this);
		},

		_handleValueHelpSearch: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			var aFilters = [];
			var oFilter = [new sap.ui.model.Filter("CodCliente", sap.ui.model.FilterOperator.StartsWith, sValue), new sap.ui.model.Filter(
				"NomeEmit", sap.ui.model.FilterOperator.Contains, sValue)];
			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("idtabClienteRelatorio").getBinding("suggestionItems").filter(aFilters);
			this.byId("idtabClienteRelatorio").suggest();
		},

		_onLoadFields: function() {
			var that = this;
			var oclientes = [];
			oTabelasRelatorio = [];
			oItemLoadVencimento = [];
			oItemLoadVencimento2 = [];
			oItemLoadVencimento3 = [];
			oItemLoadEstabelecimento = [];
			var ComboExibicao = [];

			that.byId("idIndice").setValue();
			that.byId("idtabClienteRelatorio").setValue();
			that.byId("idEstabelecimento").setSelectedKey();
			that.getView().byId("idVencimento1").setSelectedKey();
			that.getView().byId("idVencimento2").setSelectedKey();
			that.getView().byId("idVencimento3").setSelectedKey();

			var oModel = new sap.ui.model.json.JSONModel(oTabelasRelatorio);
			that.getView().setModel(oModel);
			that.getOwnerComponent().setModel(oModel, "modelRelatorioTabela");

			var aux = {
				idExibicao: 1,
				descricao: "Caixa"
			};

			var aux1 = {
				idExibicao: 2,
				descricao: "Unidade"
			};

			ComboExibicao.push(aux);
			ComboExibicao.push(aux1);
			oModel = new sap.ui.model.json.JSONModel(ComboExibicao);
			that.getOwnerComponent().setModel(oModel, "ComboExibicao");
			that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/exibicao", ComboExibicao[0].idExibicao);
			that.byId("idExibicao").setSelectedKey(ComboExibicao[0].idExibicao);

			var open1 = indexedDB.open("VB_DataBase");

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

				//CARREGA OS CAMPOS DO LOCAL DE ENTREGA
				var store = db.transaction("Clientes").objectStore("Clientes");
				store.openCursor().onsuccess = function(event) {
					var cursor = event.target.result;
					if (cursor) {
						if (cursor.value.IdBase == IdBase) {
							oclientes.push(cursor.value);

						}

						cursor.continue();
					} else {
						oModel = new sap.ui.model.json.JSONModel(oclientes);
						that.getView().setModel(oModel, "tabCliente");

						//CARREGA OS CAMPOS DO ESTABELECIMENTO
						store = db.transaction("Estabelecimento").objectStore("Estabelecimento");
						store.openCursor().onsuccess = function(event) {
							cursor = event.target.result;
							if (cursor) {

								if (cursor.value.IdBase == IdBase) {
									oItemLoadEstabelecimento.push(cursor.value);
								}
								cursor.continue();
							} else {
								oModel = new sap.ui.model.json.JSONModel(oItemLoadEstabelecimento);
								that.getView().setModel(oModel, "ComboEstabelecimento");
							}
						};
					}
				};
			};
		},

		myFormatterDataVencimento: function(fValue) {
			if (fValue.length === 1) {
				fValue = "0" + fValue;
			}
		},

		onChangeEstabelecimento: function() {
			var that = this;
			oItemLoadVencimento = [];
			oItemLoadVencimento2 = [];
			oItemLoadVencimento3 = [];
			//CARREGA OS CAMPOS DO VENCIMENTO
			var estabelecimento = that.byId("idEstabelecimento").getSelectedKey();
			that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/estabelecimento", estabelecimento);
			var IdBase = that.getOwnerComponent().getModel("modelAux").getProperty("/IdBase");

			var open1 = indexedDB.open("VB_DataBase");

			open1.onerror = function() {
				MessageBox.show(open1.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open1.onsuccess = function() {
				var db = open1.result;

				var store = db.transaction("Vencimento").objectStore("Vencimento");
				store.openCursor().onsuccess = function(event) {
					var cursor = event.target.result;
					if (cursor) {
						if (cursor.value.CodEstabel == estabelecimento && cursor.value.IdBase == IdBase) {
							oItemLoadVencimento.push(cursor.value);

						}
						cursor.continue();
					} else {
						var oModel = new sap.ui.model.json.JSONModel(oItemLoadVencimento);
						that.getView().setModel(oModel, "ComboVencimento1");
					}
				};
			};

			for (var i = 0; i < oItemLoadEstabelecimento.length; i++) {
				if (estabelecimento == oItemLoadEstabelecimento[i].CodEstabel) {
					that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/origEstabel", oItemLoadEstabelecimento[i].Estado);
				}
			}
		},

		onChangeExibicao: function() {
			var exibicao = this.byId("idExibicao").getSelectedKey();
			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/exibicao", exibicao);
		},

		onClienteChange: function(oEvent) {

			var that = this;
			oTabelasRelatorio = [];
			oItemLoadEstabelecimento = [];
			oItemVencimentoContrato = [];
			oItemVencimentoContrato2 = [];
			oItemVencimentoContrato3 = [];
			that.getView().byId("idVencimento1").setSelectedKey();
			that.getView().byId("idVencimento2").setSelectedKey();
			that.getView().byId("idVencimento3").setSelectedKey();
			that.getView().byId("idIndice").setValue();

			var oModel = new sap.ui.model.json.JSONModel(oItemLoadVencimento);
			that.getView().setModel(oModel, "ComboVencimento1");

			var fValue = this.byId("idtabClienteRelatorio").getValue();
			that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/cliente", fValue);

			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				console.log("não foi possivel encontrar e/ou carregar a base de clientes");
			};

			open.onsuccess = function() {
				var db = open.result;
				var IdBase = that.getOwnerComponent().getModel("modelAux").getProperty("/IdBase");
				var estabelecimento = that.byId("idEstabelecimento").getSelectedKey();

				var store = db.transaction("TabPrecoCliente").objectStore("TabPrecoCliente");
				store.openCursor().onsuccess = function(event) {

					var cursor = event.target.result;
					if (cursor) {
						if (cursor.value.CodCliente == fValue && cursor.value.IdBase == IdBase && cursor.value.CodEstabel == estabelecimento) {
							oTabelasRelatorio.push(cursor.value);

						}
						cursor.continue();

					} else {
						var oModel = new sap.ui.model.json.JSONModel(oTabelasRelatorio);
						that.getView().setModel(oModel);
						that.byId("idTabelaPreco").setSelectedKey(oTabelasRelatorio[0].NrTabPreco);
						that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/tabelaPreco", oTabelasRelatorio[0].NrTabPreco);
						var tabelaPreco = oTabelasRelatorio[0].NrTabPreco;

						//CARREGA OS CAMPOS DO VENCIMENTO
						store = db.transaction("TabelaPreco").objectStore("TabelaPreco");
						store.openCursor().onsuccess = function(event2) {
							var cursor2 = event2.target.result;
							if (cursor2) {
								if (cursor2.value.NrTabPreco == tabelaPreco && cursor2.value.IdBase == IdBase) {
									that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/canal", cursor2.value.PctDescCanal);
								}
								cursor2.continue();

							} else {
								store = db.transaction("ContratoCliente").objectStore("ContratoCliente");
								store.openCursor().onsuccess = function(event) {
									var cursor1 = event.target.result;
									if (cursor1) {
										if (cursor1.value.CodCliente == fValue && cursor1.value.CodEstabel == estabelecimento && cursor1.value.IdBase == IdBase) {
											that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/contrato", cursor1.value.PctDescContrato);
											that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/indice", cursor1.value.PctDescFinan);

											var aux = {
												CodCliente: cursor1.value.CodCliente,
												CodContrato: cursor1.value.CodContrato,
												CodEstabel: cursor1.value.CodEstabel,
												CodUnidNegoc: cursor1.value.CodUnidNegoc,
												IdBase: cursor1.value.IdBase,
												NomEstabel: cursor1.value.NomEstabel,
												PctDescContrato: cursor1.value.PctDescContrato,
												PctDescFinan: cursor1.value.PctDescFinan,
												QtdDias: cursor1.value.QtdDias1,
												QtdDias1: cursor1.value.QtdDias1,
												QtdDias2: cursor1.value.QtdDias2,
												QtdDias3: cursor1.value.QtdDias3,
												UnidadeNegocio: cursor1.value.UnidadeNegocio,
												idContratoCliente: cursor1.value.idContratoCliente
											};

											oItemVencimentoContrato.push(aux);

											aux = {
												CodCliente: cursor1.value.CodCliente,
												CodContrato: cursor1.value.CodContrato,
												CodEstabel: cursor1.value.CodEstabel,
												CodUnidNegoc: cursor1.value.CodUnidNegoc,
												IdBase: cursor1.value.IdBase,
												NomEstabel: cursor1.value.NomEstabel,
												PctDescContrato: cursor1.value.PctDescContrato,
												PctDescFinan: cursor1.value.PctDescFinan,
												QtdDias: cursor1.value.QtdDias2,
												QtdDias1: cursor1.value.QtdDias1,
												QtdDias2: cursor1.value.QtdDias2,
												QtdDias3: cursor1.value.QtdDias3,
												UnidadeNegocio: cursor1.value.UnidadeNegocio,
												idContratoCliente: cursor1.value.idContratoCliente
											};

											oItemVencimentoContrato2.push(aux);

											aux = {
												CodCliente: cursor1.value.CodCliente,
												CodContrato: cursor1.value.CodContrato,
												CodEstabel: cursor1.value.CodEstabel,
												CodUnidNegoc: cursor1.value.CodUnidNegoc,
												IdBase: cursor1.value.IdBase,
												NomEstabel: cursor1.value.NomEstabel,
												PctDescContrato: cursor1.value.PctDescContrato,
												PctDescFinan: cursor1.value.PctDescFinan,
												QtdDias: cursor1.value.QtdDias3,
												QtdDias1: cursor1.value.QtdDias1,
												QtdDias2: cursor1.value.QtdDias2,
												QtdDias3: cursor1.value.QtdDias3,
												UnidadeNegocio: cursor1.value.UnidadeNegocio,
												idContratoCliente: cursor1.value.idContratoCliente
											};
											oItemVencimentoContrato3.push(aux);

											// oModel = new sap.ui.model.json.JSONModel(oItemVencimentoContrato);
											// that.getView().setModel(oModel, "ComboVencimento1");

											// oModel = new sap.ui.model.json.JSONModel(oItemVencimentoContrato2);
											// that.getView().setModel(oModel, "ComboVencimento2");

											// oModel = new sap.ui.model.json.JSONModel(oItemVencimentoContrato3);
											// that.getView().setModel(oModel, "ComboVencimento3");

											if (oItemVencimentoContrato[0].QtdDias == 1 && oItemVencimentoContrato2[0].QtdDias == 2 && oItemVencimentoContrato3[0].QtdDias == 3) {
												
												oItemVencimentoContrato = [];
												oItemVencimentoContrato2 = [];
												oItemVencimentoContrato3 = [];
												var oModel = new sap.ui.model.json.JSONModel(oItemLoadVencimento);
												that.getView().setModel(oModel, "ComboVencimento1");

											} else {
												
												oModel = new sap.ui.model.json.JSONModel(oItemVencimentoContrato);
												that.getView().setModel(oModel, "ComboVencimento1");

												oModel = new sap.ui.model.json.JSONModel(oItemVencimentoContrato2);
												that.getView().setModel(oModel, "ComboVencimento2");

												oModel = new sap.ui.model.json.JSONModel(oItemVencimentoContrato3);
												that.getView().setModel(oModel, "ComboVencimento3");
												
												that.getView().byId("idVencimento1").setSelectedKey(oItemVencimentoContrato[0].QtdDias);
												that.getView().byId("idVencimento2").setSelectedKey(oItemVencimentoContrato2[0].QtdDias);
												that.getView().byId("idVencimento3").setSelectedKey(oItemVencimentoContrato3[0].QtdDias);
												
												that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento1", oItemVencimentoContrato[0].QtdDias);
												that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento2", oItemVencimentoContrato2[0].QtdDias);
												that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento3", oItemVencimentoContrato3[0].QtdDias);
												that.getView().byId("idIndice").setValue(that.getOwnerComponent().getModel("modelRelatorioTabela").getProperty(
													"/indice"));
											}

										}
										cursor1.continue();
									}
								};
							}
						};

						that.byId("idLoadTabelaPreco").focus();

					}
				};
			};
		},

		onChangeTabelaPreco: function(oEvent) {
			var that = this;
			that.byId("idLoadTabelaPreco").focus();

			var open1 = indexedDB.open("VB_DataBase");

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
				var estabelecimento = that.byId("idEstabelecimento").getSelectedKey();

				var tabelaPreco = that.byId("idTabelaPreco").getSelectedKey();
				that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/tabelaPreco", tabelaPreco);

				//CARREGA OS CAMPOS DO VENCIMENTO
				var store = db.transaction("TabelaPreco").objectStore("TabelaPreco");
				store.openCursor().onsuccess = function(event) {
					var cursor = event.target.result;
					if (cursor) {
						if (cursor.value.NrTabPreco == tabelaPreco && cursor.value.IdBase == IdBase) {
							that.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/canal", cursor.value.PctDescCanal);
						}
						cursor.continue();

					}
				};
			};
		},

		onChangeVencimento1: function() {
			indice1 = 0;
			indice2 = 0;
			indice3 = 0;
			this.byId("idLoadTabelaPreco").focus();

			oItemLoadVencimento2 = [];
			oItemLoadVencimento3 = [];
			this.getView().byId("idVencimento2").setSelectedKey();
			this.getView().byId("idVencimento3").setSelectedKey();
			var vencimento1 = this.byId("idVencimento1").getSelectedKey();
			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento1", vencimento1);
			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento2", 0);
			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento3", 0);
			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/indice", 0);

			for (var i = 0; i < oItemLoadVencimento.length; i++) {
				//ADICIONA A LISTA DE VENCIMENTOS 2
				if (parseFloat(this.getView().byId("idVencimento1").getSelectedKey()) == 1) {
					indice1 = parseFloat(oItemLoadVencimento[i].PctDescFinan);
					this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/indice", indice1);
					break;
				} else {
					if (parseInt(oItemLoadVencimento[i].QtdDias) > this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty(
							"/vencimento1")) {
						this.byId("idVencimento2").setProperty("enabled", true);
						oItemLoadVencimento2.push(oItemLoadVencimento[i]);
					}
					// //ADICIONA O INDICE 
					if (this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/vencimento1") == parseInt(oItemLoadVencimento[i].QtdDias)) {
						indice1 = parseFloat(oItemLoadVencimento[i].PctDescFinan);
						this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/indice", Math.round(parseFloat(indice1) * 100) / 100);
					}
				}
			}

			var oModel = new sap.ui.model.json.JSONModel(oItemLoadVencimento2);
			this.getView().setModel(oModel, "ComboVencimento2");
			this.byId("idIndice").setValue(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/indice"));
		},

		onChangeVencimento2: function() {
			indice2 = 0;
			indice3 = 0;
			oItemLoadVencimento3 = [];
			this.byId("idLoadTabelaPreco").focus();
			this.getView().byId("idVencimento3").setSelectedKey();
			var DiasVenc2 = parseInt(this.getView().byId("idVencimento2").getSelectedKey());
			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento3", 0);
			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento2", DiasVenc2);

			for (var i = 0; i < oItemLoadVencimento2.length; i++) {
				if (parseInt(oItemLoadVencimento2[i].QtdDias) > DiasVenc2) {
					this.byId("idVencimento2").setProperty("enabled", true);
					oItemLoadVencimento3.push(oItemLoadVencimento2[i]);
				}
				//ADICIONA O INDICE (%)
				if (parseInt(oItemLoadVencimento2[i].QtdDias) == parseInt(DiasVenc2)) {
					indice2 = parseFloat(oItemLoadVencimento2[i].PctDescFinan);
					var Desconto = (indice1 + indice2) / 2;
					this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/indice", Math.round(parseFloat(Desconto) * 100) / 100);
				}
			}
			this.byId("idVencimento3").setProperty("enabled", true);

			var oModel = new sap.ui.model.json.JSONModel(oItemLoadVencimento3);
			this.getView().setModel(oModel, "ComboVencimento3");
			this.byId("idIndice").setValue(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/indice"));
		},

		onChangeVencimento3: function() {
			indice3 = 0;
			this.byId("idLoadTabelaPreco").focus();
			var DiasVenc1 = parseInt(this.byId("idVencimento1").getSelectedKey());
			var DiasVenc2 = parseInt(this.byId("idVencimento2").getSelectedKey());
			var DiasVenc3 = parseInt(this.byId("idVencimento3").getSelectedKey());

			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/vencimento3", DiasVenc3);

			for (var i = 0; i < oItemLoadVencimento.length; i++) {
				if (parseInt(oItemLoadVencimento[i].QtdDias) == parseInt(DiasVenc1)) {
					indice1 = parseFloat(oItemLoadVencimento[i].PctDescFinan);
					var Dias = oItemLoadVencimento[i].QtdDias;
					var CodEstabel = oItemLoadVencimento[i].CodEstabel;
				}
				if (parseInt(oItemLoadVencimento[i].QtdDias) == parseInt(DiasVenc2)) {
					indice2 = parseFloat(oItemLoadVencimento[i].PctDescFinan);
					var Dias2 = oItemLoadVencimento[i].QtdDias;
					var CodEstabel2 = oItemLoadVencimento[i].CodEstabel;
				}
				if (parseInt(oItemLoadVencimento[i].QtdDias) == parseInt(DiasVenc3)) {
					indice3 = parseFloat(oItemLoadVencimento[i].PctDescFinan);
					var Dias3 = oItemLoadVencimento[i].QtdDias;
					var CodEstabel3 = oItemLoadVencimento[i].CodEstabel;
				}
			}
			var DescontoTotal = (indice1 + indice2 + indice3) / 3;
			this.getOwnerComponent().getModel("modelRelatorioTabela").setProperty("/indice", Math.round(parseFloat(DescontoTotal) * 100) / 100);
			this.byId("idIndice").setValue(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/indice"));

		},

		loadTabelaPreco: function() {
			console.log(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/indice"));
			console.log(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/vencimento1"));
			console.log(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/vencimento2"));
			console.log(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/vencimento3"));
			console.log(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/cliente"));
			console.log(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/estabelecimento"));
			console.log(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/tabelaPreco"));
			console.log(this.getOwnerComponent().getModel("modelRelatorioTabela").getProperty("/canal"));
			sap.ui.core.UIComponent.getRouterFor(this).navTo("detalhesRelatorioTabelas");

		},

		onDataExport: sap.m.Table.prototype.exportData || function(oEvent) {
			var oModel = new sap.ui.model.json.JSONModel(oTabelasRelatorio);
			this.getView().setModel(oModel);

			var oExport = new sap.ui.core.util.Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: oModel,
				// binding information for the rows aggregation
				rows: {
					path: "/"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: "Cod Cliente",
					template: {
						content: "{CodCliente}"
					}
				}, {
					name: "Cod Estabel",
					template: {
						content: "{CodEstabel}"
					}
				}, {
					name: "Nome Estabel",
					template: {
						content: "{NomEstabel}"
					}
				}, {
					name: "Nº Tab Preço",
					template: {
						content: "{NrTabPreco}"
					}
				}, {
					name: "Desc. Tabela",
					template: {
						content: "{DescTabela}"
					}
				}, {
					name: "Juros",
					template: {
						content: "{ValSdoTitAcr}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		}
	});
});