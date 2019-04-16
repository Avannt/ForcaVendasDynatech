/*eslint-disable no-console, no-alert */
sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"testeui5/model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("testeui5.controller.PedidoDetalhe", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("pedidoDetalhe").attachPatternMatched(this._onLoadFields, this);
		},

		_onLoadFields: function () {
			var that = this;

			that.oItemTemplate = [];
			that.oVetorMateriais = [];
			that.indexItem = 0;
			that.oVetorTabPreco = [];
			that.oVetorTipoTransporte = [];
			that.oVetorFormasPagamentos = [];
			that.oVetorTipoNegociacao = [];
			that.oVetorTiposPedidos = [];

			//Tabelas de preços max e min
			that.oVetorSeqPrecoMax = [];
			that.oVetorSeqPrecoMin = [];

			that.objItensPedidoTemplate = [];
			that.oItemPedido = [];

			var aTemp = [];

			var oModel = new sap.ui.model.json.JSONModel(aTemp);
			this.getView().setModel(oModel);

			this.getView().setModel(this.getView().getModel("modelCliente"));
			this.getView().setModel(this.getView().getModel("modelAux"));

			//Qualquer alteração obriga a salvar no dados pedido. (true a validação passa / false pracisa barrar);
			this.getOwnerComponent().getModel("modelAux").setProperty("/ObrigaSalvar", true);

			this.byId("tabItensPedidoStep").setProperty("enabled", false);
			this.byId("tabTotalStep").setProperty("enabled", false);

			var open = indexedDB.open("VB_DataBase");

			open.onerror = function () {
				MessageBox.show("Não foi possivel fazer leitura do Banco Interno.", {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function () {
				var db = open.result;

				var promise = new Promise(function (resolve, reject) {
					that.onCarregaCampos(db);
					resolve();
				});

				promise.then(function (value) {
					if (that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli") === "") {
						console.log("Criando numero pedido");
						that.onCriarNumeroPedido();
					} else {
						console.log("Carregando dados PrePedido");
						that.onCarregaDadosPedido(db);
					}
				});
			};
		},

		formatNumber: function (value) {
			return value.toLocaleString("pt-BR");
		},
		onResetaCamposPrePedido: function () {
			var that = this;

			//*modelDadosPedido
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/SituacaoPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IdStatusPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataImpl", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoTransporte", "CIF");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Completo", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotPed", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValDescontoTotal", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TotalItensPedido", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Ntgew", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/FormaPagamento", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/zlsch", "L");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TabPreco", "");
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/LocalEntrega", "");
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DiasPrimeiraParcela", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/QuantParcelas", 1);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IntervaloParcelas", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ObservacaoPedido", "");
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ObservacaoAuditoriaPedido", "");
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ExisteEntradaPedido", false);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercEntradaPedido", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValorEntradaPedido", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoNegociacao", "");
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValMinPedido", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaPedido", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoPedido", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampGlobal", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampBrinde", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampEnxoval", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalAcresPrazoMed", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteDesconto", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoUtilizadaDesconto", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaUtilizadaDesconto", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoPrazoMed", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoDesconto", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoPrazoMed", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalAbatidoComissao", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalAbatidoVerba", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalCampGlobal", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampBrinde", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampGlobal", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalCampEnxoval", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/valUtilizadoCampEnxoval", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalCampProdutoAcabado", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampProdutoAcabado", 0);

			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBrinde", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaPrazoMed", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBrinde", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteAmostra", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaAmostra", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoAmostra", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBonif", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBonif", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBonif", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PrazoMedioParcelas", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValParcelasPedido", "");
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/QuantidadeParcelasPedido", "");
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/EntradaPedido", "");

			this.byId("idTabelaPreco").setSelectedKey();
			this.byId("idTipoPedido").setSelectedKey();
			this.byId("idFormaPagamento").setSelectedKey();

			that.objItensPedidoTemplate = [];
			var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
			this.getView().setModel(oModel, "ItensPedidoGrid");

			this.onBloqueiaPrePedido();
		},

		//CARREGA OS CAMPOS, POPULANDO OS COMBO BOX
		onCarregaCampos: function (db, resolve, reject) {
			var that = this;
			that.oVetorTabPreco = [];
			that.oVetorMateriais = [];
			that.oVetorTipoTransporte = [];
			that.oVetorTipoNegociacao = [];
			that.objItensPedidoTemplate = [];
			that.oVetorFormasPagamentos = [];

			var data = this.onDataAtualizacao();

			var Kunnr = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");

			//Inicialização de Variáveis. *modelDadosPedido
			this.onResetaCamposPrePedido();

			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/SituacaoPedido", "Em digitação");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IdStatusPedido", 1);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataImpl", data[0] + "-" + data[1]);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataPedido", data[0]);

			//Tipos Pedidos
			var transactionTiposPedidos = db.transaction("TiposPedidos", "readonly");
			var objectStoreTiposPedidos = transactionTiposPedidos.objectStore("TiposPedidos");

			if ("getAll" in objectStoreTiposPedidos) {
				objectStoreTiposPedidos.getAll().onsuccess = function (event) {
					that.oVetorTiposPedidos = event.target.result;

					var oModel = new sap.ui.model.json.JSONModel(that.oVetorTiposPedidos);
					that.getView().setModel(oModel, "tiposPedidos");
				};
			}

			// //Tipos Pedidos
			// var transactionA990 = db.transaction("A990", "readonly");
			// var objectStoreA990 = transactionA990.objectStore("A990");

			// if ("getAll" in objectStoreA990) {
			// 	objectStoreA990.getAll().onsuccess = function(event) {
			// 		that.oVetorTiposPedidos = event.target.result;

			// 		var oModel = new sap.ui.model.json.JSONModel(that.oVetorTiposPedidos);
			// 		that.getView().setModel(oModel, "tiposPedidos");
			// 	};
			// }

			//CARREGA NEGOCIOAÇÃO
			that.oVetorTipoNegociacao = [{
				idNegociacao: "01",
				descNegociacao: "À vista"
			}, {
				idNegociacao: "02",
				descNegociacao: "À prazo"
			}];

			var oModelNegociacao = new sap.ui.model.json.JSONModel(that.oVetorTipoNegociacao);
			that.getView().setModel(oModelNegociacao, "tipoNegociacao");

			//CARREGA TIPO DE TRANSPORTE
			that.oVetorTipoTransporte = [{
				idTransporte: "CIF"
			}, {
				idTransporte: "FOB"
			}];
			var oModel = new sap.ui.model.json.JSONModel(that.oVetorTipoTransporte);
			that.getView().setModel(oModel, "tipoTransporte");

			var transactionFormasPagamentos = db.transaction("FormasPagamentos", "readonly");
			var objectStoreFormasPagamentos = transactionFormasPagamentos.objectStore("FormasPagamentos");

			if ("getAll" in objectStoreFormasPagamentos) {
				objectStoreFormasPagamentos.getAll().onsuccess = function (event) {
					that.oVetorFormasPagamentos = event.target.result;

					oModel = new sap.ui.model.json.JSONModel(that.oVetorFormasPagamentos);
					that.getView().setModel(oModel, "formasPagamentos");
				};
			}

			//Busca o preço do item
			var storeOrdensTabPreco = db.transaction("OrdensTabPreco", "readwrite");
			var objOrdensTabPreco = storeOrdensTabPreco.objectStore("OrdensTabPreco");

			// var indexOrdensTabPreco = objOrdensTabPreco.index("kozgf");

			//Pega a seq para pesquisar o preço do item nas tabelas de preço. 
			// (Pra essa pesquisa, kozgf === "ZPR0" é para o preço cheio do produto)
			// (Pra essa pesquisa, kozgf === "ZPRMIN" é para o preço minimo do produto)
			var requestOrdensTabPreco = objOrdensTabPreco.getAll();

			requestOrdensTabPreco.onsuccess = function (e) {
				var oOrdensTabPreco = e.target.result;

				//validação feita para ver se a tabela de seq tab preço está cadastrada
				if (oOrdensTabPreco !== undefined) {

					for (var i = 0; i < oOrdensTabPreco.length; i++) {
						if (oOrdensTabPreco[i].kozgf === "ZPR0") {
							that.oVetorSeqPrecoMax.push(oOrdensTabPreco[i]);
						} else if (oOrdensTabPreco[i].kozgf === "ZMIN") {
							that.oVetorSeqPrecoMin.push(oOrdensTabPreco[i]);
						}
					}
				}
			};

			var transactionA990 = db.transaction("A990", "readonly");
			var objectStoreA990 = transactionA990.objectStore("A990");

			if ("getAll" in objectStoreA990) {
				objectStoreA990.getAll().onsuccess = function (event) {
					that.oVetorA990 = event.target.result;
				};
			}

			var transactionA406 = db.transaction("A406", "readonly");
			var objectStoreA406 = transactionA406.objectStore("A406");

			if ("getAll" in objectStoreA406) {
				objectStoreA406.getAll().onsuccess = function (event) {
					that.oVetorA406 = event.target.result;
				};
			}

			var transactionA991 = db.transaction("A991", "readonly");
			var objectStoreA991 = transactionA991.objectStore("A991");

			if ("getAll" in objectStoreA991) {
				objectStoreA991.getAll().onsuccess = function (event) {
					that.oVetorA991 = event.target.result;
				};
			}

			var transactionTabPreco = db.transaction("TabPreco", "readonly");
			var objectStoreTabPreco = transactionTabPreco.objectStore("TabPreco");

			if ("getAll" in objectStoreTabPreco) {
				objectStoreTabPreco.getAll().onsuccess = function (event) {
					that.oVetorTabPreco = event.target.result;

					oModel = new sap.ui.model.json.JSONModel(that.oVetorTabPreco);
					that.getView().setModel(oModel, "tabPreco");
				};
			}
		},

		onCriarNumeroPedido: function () {
			var CodRepres = this.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Completo", "Não");
			this.byId("idTopLevelIconTabBar").setSelectedKey("tab1");

			var date = new Date();
			var dia = String(date.getDate());
			var mes = String(date.getMonth() + 1);
			var ano = String(date.getFullYear());
			var minuto = String(date.getMinutes());
			var hora = String(date.getHours());
			var seg = String(date.getSeconds());

			if (dia.length === 1) {
				dia = "0" + String(dia);
			}

			if (mes.length === 1) {
				mes = "0" + String(mes);
			}

			if (minuto.length === 1) {
				minuto = "0" + String(minuto);
			}
			if (hora.length === 1) {
				hora = "0" + String(hora);
			}
			if (seg.length === 1) {
				seg = "0" + String(seg);
			}
			//HRIMP E DATIMP
			var data = String(ano + mes + dia);
			var horario = String(hora) + String(minuto) + String(seg);

			var numeroPed = CodRepres + "." + data + "." + horario;
			this.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", numeroPed);

			// this.onCarregaCliente();
			this.onBloqueiaPrePedidoTotal(true);
		},

		onCarregaDadosPedido: function (db) {

			var that = this;
			that.objItensPedidoTemplate = [];
			var vetorAux = [];

			this.byId("tabItensPedidoStep").setProperty("enabled", true);
			this.byId("tabBalancoVerbaStep").setProperty("enabled", true);
			this.byId("tabTotalStep").setProperty("enabled", true);
			// this.byId("tabItensDiluicaoPedidoStep").setProperty("enabled", true);

			var store = db.transaction("PrePedidos", "readwrite");
			var objPrePedidos = store.objectStore("PrePedidos");

			var requestPrePedidos = objPrePedidos.get(that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"));

			requestPrePedidos.onsuccess = function (e) {
				var oPrePedido = e.target.result;

				if (oPrePedido === undefined) {

					that.onCriarNumeroPedido();

				} else {

					that.byId("idTopLevelIconTabBar").setSelectedKey("tab1");

					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/SituacaoPedido", oPrePedido.situacaoPedido);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IdStatusPedido", oPrePedido.idStatusPedido);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataImpl", oPrePedido.dataImpl);

					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TabPreco", oPrePedido.tabPreco);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoPedido", oPrePedido.tipoPedido);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/CodUsr", oPrePedido.codUsr);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/FormaPagamento", oPrePedido.zlsch);

					that.byId("idTabelaPreco").setSelectedKey(oPrePedido.tabPreco);
					that.byId("idTipoPedido").setSelectedKey(oPrePedido.tipoPedido);
					that.byId("idFormaPagamento").setSelectedKey(oPrePedido.zlsch);

					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Ntgew", oPrePedido.ntgew);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotPed", oPrePedido.valTotPed);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValDescontoTotal", oPrePedido.valDescontoTotal);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TotalItensPedido", oPrePedido.totalItensPedido);
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Completo", oPrePedido.completo);

					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DiasPrimeiraParcela", oPrePedido.diasPrimeiraParcela);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/QuantParcelas", oPrePedido.quantParcelas);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IntervaloParcelas", oPrePedido.intervaloParcelas);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ObservacaoPedido", oPrePedido.observacaoPedido);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ObservacaoAuditoriaPedido", oPrePedido.observacaoAuditoriaPedido);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ExisteEntradaPedido", oPrePedido.existeEntradaPedido);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercEntradaPedido", oPrePedido.percEntradaPedido);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValorEntradaPedido", oPrePedido.valorEntradaPedido);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValMinPedido", oPrePedido.valMinPedido);

					//Tela cabeçalho (2º aba)
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoTransporte", oPrePedido.tipoTransporte);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoNegociacao", oPrePedido.tipoNegociacao);

					//Seleciona o valor do combo
					// that.byId("idTipoTransporte").setSelectedKey(oPrePedido.tipoTransporte);
					// that.byId("idTipoNegociacao").setSelectedKey(oPrePedido.tipoNegociacao);

					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoNegociacao", oPrePedido.tipoNegociacao);

					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedentePrazoMed", oPrePedido.valTotalExcedentePrazoMed);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteDesconto", oPrePedido.valTotalExcedenteDesconto);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampEnxoval", oPrePedido.valCampEnxoval);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampBrinde", oPrePedido.valCampBrinde);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampGlobal", oPrePedido.valCampGlobal);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaPedido", oPrePedido.valVerbaPedido);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoPedido", oPrePedido.valComissaoPedido);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissao", oPrePedido.valComissao);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoUtilizadaDesconto", oPrePedido.valComissaoUtilizadaDesconto);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaUtilizadaDesconto", oPrePedido.valVerbaUtilizadaDesconto);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoPrazoMed", oPrePedido.valUtilizadoComissaoPrazoMed);

					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoDesconto", oPrePedido.valTotalExcedenteNaoDirecionadoDesconto);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoPrazoMed", oPrePedido.valTotalExcedenteNaoDirecionadoPrazoMed);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalAbatidoComissao", oPrePedido.valTotalAbatidoComissao);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalAbatidoVerba", oPrePedido.valTotalAbatidoVerba);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalCampGlobal", oPrePedido.valTotalCampGlobal);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampBrinde", oPrePedido.valUtilizadoCampBrinde);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampGlobal", oPrePedido.valUtilizadoCampGlobal);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalCampEnxoval", oPrePedido.valTotalCampEnxoval);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampEnxoval", oPrePedido.valUtilizadoCampEnxoval);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalCampProdutoAcabado", oPrePedido.valTotalCampProdutoAcabado);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampProdutoAcabado", oPrePedido.valUtilizadoCampProdutoAcabado);

					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBrinde", oPrePedido.valTotalExcedenteBrinde);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", oPrePedido.valUtilizadoVerbaBrinde);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaPrazoMed", oPrePedido.valUtilizadoVerbaPrazoMed);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBrinde", oPrePedido.valUtilizadoComissaoBrinde);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteAmostra", oPrePedido.valTotalExcedenteAmostra);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaAmostra", oPrePedido.valUtilizadoVerbaAmostra);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoAmostra", oPrePedido.valUtilizadoComissaoAmostra);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBonif", oPrePedido.valTotalExcedenteBonif);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBonif", oPrePedido.valUtilizadoVerbaBonif);
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBonif", oPrePedido.valUtilizadoComissaoBonif);

					// that.onBloqueioFormaPagamento(oPrePedido.tipoPedido);

					// that.onCarregaCliente();

					var promise = new Promise(function (resolve, reject) {
						that.onCarregaMateriais(db, oPrePedido.tipoPedido, resolve, reject);
						console.log("Carrega materiais sem preço");
					});

					promise.then(function (resolve) {
						// console.log("Carrega materiais com preço");
						// that.onCarregaMateriaisComPreco(db, oPrePedido.tabPreco, that.oVetorMateriais);
					});

					var storeItensPedido = db.transaction("ItensPedido", "readwrite").objectStore("ItensPedido");
					storeItensPedido.openCursor().onsuccess = function (event) {
						// consulta resultado do event
						var cursor = event.target.result;
						if (cursor) {
							if (cursor.value.nrPedCli === that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli")) {

								that.objItensPedidoTemplate.push(cursor.value);

							}
							cursor.continue();
						} else {

							var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
							that.getView().setModel(oModel, "ItensPedidoGrid");

							if (oPrePedido.idStatusPedido === 3 || oPrePedido.idStatusPedido === 2) {
								that.onBloqueiaPrePedidoTotal(false);
							} else {
								that.onBloqueiaPrePedidoTotal(true);
								that.onBloqueiaPrePedido();
								that.byId("idTopLevelIconTabBar").setSelectedKey("tab1");
							}
							// that.calculaTotalPedido();
						}
					};
				}
			};
		},

		onDataAtualizacao: function () {
			var date = new Date();
			var dia = String(date.getDate());
			var mes = String(date.getMonth() + 1);
			var ano = String(date.getFullYear());
			var minuto = String(date.getMinutes());
			var hora = String(date.getHours());
			var seg = String(date.getSeconds());

			if (dia.length === 1) {
				dia = String("0" + dia);
			}
			if (mes.length === 1) {
				mes = String("0" + mes);
			}
			if (minuto.length === 1) {
				minuto = String("0" + minuto);
			}
			if (hora.length === 1) {
				hora = String("0" + hora);
			}
			if (seg.length === 1) {
				seg = String("0" + seg);
			}
			//HRIMP E DATIMP
			var data = String(dia + "/" + mes + "/" + ano);
			var horario = String(hora) + ":" + String(minuto) + ":" + String(seg);

			return [data, horario];
		},

		onCarregaMateriais: function (db, tipoPedido, resolve, reject) {
			var that = this;

			var transaction = db.transaction("Materiais", "readonly");
			var objectStoreMaterial = transaction.objectStore("Materiais");

			var indexMtpos = objectStoreMaterial.index("mtpos");
			var request = indexMtpos.getAll();

			request.onsuccess = function (event) {
				that.oVetorMateriais = event.target.result;

				var oModel = new sap.ui.model.json.JSONModel(that.oVetorMateriais);
				that.getView().setModel(oModel, "materiaisCadastrados");

				console.log("Materiais carregados: mtpos: " + tipoPedido);
				resolve();
			};
		},

		onCarregaMateriaisComPreco: function (db, tabPreco, vetorMateriais) {

			var vetorResultMateriais = [];
			var tabbri = this.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabbri;
			var tabamo = this.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabamo;
			var tabbon = this.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabbon;

			var werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
			var that = this;

			for (var i = 0; i < vetorMateriais.length; i++) {

				if (vetorMateriais[i].mtpos === "NORM") {

					var storeA960 = db.transaction("A960", "readwrite");
					var objA960 = storeA960.objectStore("A960");

					var idA960 = werks + "." + tabPreco + "." + vetorMateriais[i].matnr;
					var requesA960 = objA960.get(idA960);

					requesA960.onsuccess = function (e) {
						var oA960 = e.target.result;
						if (oA960 != undefined) {
							for (var j = 0; j < vetorMateriais.length; j++) {
								if (oA960.matnr === vetorMateriais[j].matnr) {
									vetorResultMateriais.push(vetorMateriais[j]);
									break;
								}
							}
						}
					};

				} else if (vetorMateriais[i].mtpos === "YAMO" || vetorMateriais[i].mtpos === "YBRI" || vetorMateriais[i].mtpos === "YBON") {
					var tabPrecoAB = "";

					if (vetorMateriais[i].mtpos === "YBRI") {
						tabPrecoAB = tabbri;
					} else if (vetorMateriais[i].mtpos === "YAMO") {
						tabPrecoAB = tabamo;
					} else if (vetorMateriais[i].mtpos === "YBON") {
						tabPrecoAB = tabbri;
					}

					storeA960 = db.transaction("A960", "readwrite");
					objA960 = storeA960.objectStore("A960");

					idA960 = werks + "." + tabPrecoAB + "." + vetorMateriais[i].matnr;
					var requesA963 = objA960.get(idA960);

					requesA963.onsuccess = function (e) {
						var oA960 = e.target.result;

						if (oA960 != undefined) {
							for (var j = 0; j < vetorMateriais.length; j++) {

								if (oA960.matnr === vetorMateriais[j].matnr) {
									vetorResultMateriais.push(vetorMateriais[j]);
									break;
								}
							}
						}
					};
				}
			}

			var oModel = new sap.ui.model.json.JSONModel(vetorResultMateriais);
			that.getView().setModel(oModel, "materiaisCadastrados");

		},
		/// EVENTOS CAMPOS							<<<<<<<<<<<<

		onChangeTipoPedido: function (evt) {

			//Toda vez tem que resetar a tabela de preço pra ativar novamente o evento e filtrar os materiais com preço.
			this.byId("idTabelaPreco").setSelectedKey();
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TabPreco", "");

			var that = this;
			var tipoPedido = "";
			var vetorAux = [];

			var oSource = evt.getSource();
			tipoPedido = oSource.getSelectedKey();

			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoPedido", tipoPedido);

			// this.onBloqueioFormaPagamento(tipoPedido);

			var open = indexedDB.open("VB_DataBase");
			open.onerror = function () {
				MessageBox.show("Não foi possivel fazer leitura do Banco Interno.", {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function () {
				var db = open.result;

				var promise = new Promise(function (resolve, reject) {
					that.onCarregaMateriais(db, tipoPedido, resolve);
				});

			};
		},

		onChangeTabelaPreco: function (evt) {
			var that = this;
			var oSource = evt.getSource();
			var vetorResultMateriais = [];

			console.log("Change Tabela Preço Event");
			that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TabPreco", oSource.getSelectedKey());

			//PRECISA PREENCHER O TIPO DE PEDIDO ANTES, POIS O TIPO DE PEDIDO CARREGA OS MATERIAIS PARA CADA TIPO.
			//DEPOIS DISSO ESSE METODO IRÁ FILTRAR TODOS OS MATERIAIS COM PREÇO.
			// this.getOwnerComponent().getModel("modelAux").setProperty("/ObrigaSalvar", false);

			// var open = indexedDB.open("VB_DataBase");

			// open.onerror = function() {
			// 	MessageBox.show("Não foi possivel fazer leitura do Banco Interno.", {
			// 		icon: MessageBox.Icon.ERROR,
			// 		title: "Banco não encontrado!",
			// 		actions: [MessageBox.Action.OK]
			// 	});
			// };

			// open.onsuccess = function() {
			// 	var db = open.result;

			// 	var tipoPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");
			// 	if (tipoPedido === "") {

			// 		MessageBox.show("Selecione Tipo de pedido!", {
			// 			icon: sap.m.MessageBox.Icon.WARNING,
			// 			title: "Pre-requisito!",
			// 			actions: [MessageBox.Action.OK],
			// 			onClose: function() {
			// 				oSource.setSelectedKey();
			// 			}
			// 		});

			// 	} else {
			// 		that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TabPreco", oSource.getSelectedKey());
			// 		// that.onCarregaMateriaisComPreco(db, oSource.getSelectedKey(), that.oVetorMateriais);
			// 	}
			// };
		},

		onChangeFormaPagamento: function (evt) {

			var oSource = evt.getSource();
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/FormaPagamento", oSource.getSelectedKey());
			this.getOwnerComponent().getModel("modelAux").setProperty("/ObrigaSalvar", false);

		},

		/// FIM EVENTOS CAMPOS

		/// EVENTOS UTILITARIOS <<<<<<<<<<<<

		bloquearCampos: function () {

			// this.byId("idEstabelecimento").setProperty("enabled", false);
			this.byId("idTipoPedido").setProperty("enabled", false);
			// this.byId("idVencimento1").setProperty("enabled", false);
			// this.byId("idVencimento2").setProperty("enabled", false);
			// this.byId("idVencimento3").setProperty("enabled", false);
			this.byId("idTabelaPreco").setProperty("enabled", false);
			this.byId("idFormaPagamento").setProperty("enabled", false);
			// this.byId("idTipoTransporte").setProperty("enabled", false);

		},

		desbloquearCampos: function () {
			// this.byId("idEstabelecimento").setProperty("enabled", true);
			this.byId("idTipoPedido").setProperty("enabled", true);
			this.byId("idTabelaPreco").setProperty("enabled", true);
			this.byId("idFormaPagamento").setProperty("enabled", true);
			// this.byId("idVencimento1").setProperty("enabled", true);
			// this.byId("idVencimento2").setProperty("enabled", true);
			// this.byId("idVencimento3").setProperty("enabled", true);
			// this.byId("idTipoTransporte").setProperty("enabled", true);

		},

		resetarCamposTela: function () {

			this.byId("idNumeroPedido").setValue("");
			this.byId("idSituacao").setValue("");
			this.byId("idDataPedido").setValue("");
			this.byId("idTipoPedido").setSelectedKey("");
			// this.byId("idTipoNegociacao").setSelectedKey("");
			this.byId("idTabelaPreco").setSelectedKey("");
			this.byId("idFormaPagamento").setSelectedKey("");
			this.byId("idValorMinimoPedido").setValue("");
			// this.byId("idTipoTransporte").setSelectedKey("");
			// this.byId("idDataEntrega").setSelectedKey("");
			// this.byId("idLocalEntrega").setSelectedKey("");
			// this.byId("idPrimeiraParcela").setValue("");
			// this.byId("idQuantParcelas").setValue("");
			// this.byId("idIntervaloParcelas").setValue("");
			// this.byId("idObservacoes").setText("");

		},

		onNavBack: function () {

			sap.ui.core.UIComponent.getRouterFor(this).navTo("pedido");
			this.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
			this.getOwnerComponent().getModel("modelAux").setProperty("/Kunnr", "");
			//Essa propriedade serve para identificação se o kra te, o numero CNPJ, se tiver em branco o kra é pessia física.
			this.getOwnerComponent().getModel("modelAux").setProperty("/idFiscalCliente", "");
			this.onResetaCamposPrePedido();

		},

		/// FIM EVENTOS UTILITARIOS

		// EVENTOS DO FRAGMENTO 					<<<<<<<<<<<<

		onInicializaItemPedido: function () {
			var that = this;
			that.oItemPedido.aumng = 0;
			that.oItemPedido.extwg = "";
			that.oItemPedido.maktx = "";
			that.oItemPedido.maktx = "";
			that.oItemPedido.matnr = "";
			that.oItemPedido.mtpos = "";
			that.oItemPedido.ntgew = 0;
			that.oItemPedido.zzQnt = 0;
			that.oItemPedido.zzDesitem = 0;
			that.oItemPedido.zzVprod = 0;
			that.oItemPedido.zzVprodMin = 0;
			that.oItemPedido.zzVprodDesc = 0;

		},

		onItemChange: function (oEvent) {
			var that = this;
			var itemExistente = false;
			var codItem = oEvent.getSource().getValue();
			var oPanel = sap.ui.getCore().byId("idDialog");
			oPanel.setBusy(true);
			var encontrouPrecoMax = false;
			var encontrouPrecoMin = false;

			var cliente = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");
			var spart = that.getOwnerComponent().getModel("modelAux").getProperty("/Spart");
			var werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
			var tabPreco = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco");
			var tipoPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");

			var open = indexedDB.open("VB_DataBase");

			open.onerror = function () {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function () {
				var db = open.result;

				oPanel.setBusy(true);

				if (codItem !== "") {

					var store = db.transaction("Materiais", "readwrite");
					var objMaterial = store.objectStore("Materiais");

					var requestMaterial = objMaterial.get(codItem);

					requestMaterial.onsuccess = function (e) {
						var oMaterial = e.target.result;

						if (oMaterial === undefined) {
							oPanel.setBusy(false);

							MessageBox.show("Não existe o produto: " + codItem, {
								icon: MessageBox.Icon.ERROR,
								title: "Produto não encontrado.",
								actions: [MessageBox.Action.YES],
								onClose: function () {
									that.onResetaCamposDialog();
									sap.ui.getCore().byId("idItemPedido").focus();
								}
							});

						} else {
							that.onInicializaItemPedido();

							that.oItemPedido.zzQnt = 1;
							that.oItemPedido.matnr = oMaterial.matnr;
							that.oItemPedido.maktx = oMaterial.maktx;
							that.oItemPedido.ntgew = parseFloat(oMaterial.ntgew);
							that.oItemPedido.aumng = parseInt(oMaterial.aumng, 10);
							that.oItemPedido.extwg = oMaterial.extwg;
							that.oItemPedido.mtpos = oMaterial.mtpos;

							//Lógica para encontrar o preço de venda do produto. Respeitar o vetor de seq das tabelas.
							for (var i = 0; i < that.oVetorSeqPrecoMax.length; i++) {

								if (that.oVetorSeqPrecoMax[i].kotabnr === "990") {

									for (var j = 0; j < that.oVetorA990.length; j++) {
										if (that.oVetorA990[j].werks === werks && that.oVetorA990[j].kschl === "ZPR0" && that.oVetorA990[j].kunnr === cliente &&
											that.oVetorA990[j].matnr === codItem) {
											that.oItemPedido.zzVprod = parseFloat(that.oVetorA990[j].kbetr);
											encontrouPrecoMax = true;
											break;
										}
									}

								} else if (that.oVetorSeqPrecoMax[i].kotabnr === "406") {
									for (j = 0; j < that.oVetorA406.length; j++) {
										if (that.oVetorA406[j].werks === werks && that.oVetorA406[j].matnr === codItem) {
											that.oItemPedido.zzVprod = parseFloat(that.oVetorA406[j].kbetr);
											encontrouPrecoMax = true;
											break;
										}
									}

								} else if (that.oVetorSeqPrecoMax[i].kotabnr === "991") {
									for (j = 0; j < that.oVetorA991.length; j++) {
										if (that.oVetorA991[j].werks === werks && that.oVetorA991[j].kschl === "ZPR0" && that.oVetorA991[j].matnr === codItem &&
											that.oVetorA991[j].spart === spart) {
											that.oItemPedido.zzVprod = parseFloat(that.oVetorA991[j].kbetr);
											encontrouPrecoMax = true;
											break;
										}
									}
								}
							}

							if (encontrouPrecoMax === false) {

								MessageBox.show("Não existe preço de venda cadastrado para o produto: " + that.oItemPedido.matnr, {
									icon: MessageBox.Icon.ERROR,
									title: "Produto sem preço de venda!",
									actions: ["OK"],
									onClose: function () {
										that.onResetaCamposDialog();
										oPanel.setBusy(false);
										sap.ui.getCore().byId("idItemPedido").setValue("");
										return;
									}
								});
							} else {

								//Lógica para encontrar o preço de Min permitido do produto. Respeitar o vetor de seq das tabelas.
								for (i = 0; i < that.oVetorSeqPrecoMin.length; i++) {

									if (that.oVetorSeqPrecoMin[i].kotabnr === "990") {

										for (var j = 0; j < that.oVetorA990.length; j++) {
											if (that.oVetorA990[j].werks === werks && that.oVetorA990[j].kschl === "ZMIN" && that.oVetorA990[j].kunnr === cliente &&
												that.oVetorA990[j].matnr === codItem) {
												that.oItemPedido.zzVprodMin = parseFloat(that.oVetorA990[j].kbetr);
												encontrouPrecoMin = true;
												break;
											}
										}

									} else if (that.oVetorSeqPrecoMin[i].kotabnr === "406") {
										for (j = 0; j < that.oVetorA406.length; j++) {
											if (that.oVetorA406[j].werks === werks && that.oVetorA406[j].matnr === codItem) {
												that.oItemPedido.zzVprodMin = parseFloat(that.oVetorA406[j].kbetr);
												encontrouPrecoMax = true;
												break;
											}
										}

									} else if (that.oVetorSeqPrecoMin[i].kotabnr === "991") {
										for (j = 0; j < that.oVetorA991.length; j++) {
											if (that.oVetorA991[j].werks === werks && that.oVetorA991[j].kschl === "ZMIN" && that.oVetorA991[j].matnr === codItem &&
												that.oVetorA991[j].spart === spart) {
												that.oItemPedido.zzVprodMin = parseFloat(that.oVetorA991[j].kbetr);
												encontrouPrecoMax = true;
												break;
											}
										}
									}
								}

								if (encontrouPrecoMin === false) {

									MessageBox.show("Não existe preço mínimo cadastrado para o produto: " + that.oItemPedido.matnr, {
										icon: MessageBox.Icon.ERROR,
										title: "Produto sem preço de venda!",
										actions: ["OK"],
										onClose: function () {
											that.onResetaCamposDialog();
											oPanel.setBusy(false);
											sap.ui.getCore().byId("idItemPedido").setValue("");
											return;
										}
									});
								}

								that.calculaPrecoItem();
								that.popularCamposItemPedido();
								sap.ui.getCore().byId("idQuantidade").focus();
								oPanel.setBusy(false);
							}
						}
					};
				} else {
					oPanel.setBusy(false);
					that.onResetaCamposDialog();
				}
			};
		},

		onCriarIndexItemPedido: function () {
			var that = this;

			//Define o index do produto a ser inserido
			for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
				if (i === 0) {
					var aux = that.objItensPedidoTemplate[i].idItemPedido.split("/");
					that.indexItem = parseInt(aux[1], 10);

				} else if (i > 0) {
					aux = that.objItensPedidoTemplate[i].idItemPedido.split("/");

					if (that.indexItem < parseInt(aux[1], 10)) {
						that.indexItem = parseInt(aux[1], 10);

					}
				}
			}
			if (that.objItensPedidoTemplate.length === 0) {
				that.indexItem = 1;
			} else {
				that.indexItem += 1;
			}

			return that.indexItem;
		},

		onResetaCamposDialog: function () {
			var that = this;

			that.oItemPedido = [];
			sap.ui.getCore().byId("idItemPedido").setValue();
			sap.ui.getCore().byId("idDesconto").setValue();
			// sap.ui.getCore().byId("idPrecoCheio").setValue();
			// sap.ui.getCore().byId("idPrecoDesconto").setValue();
			// sap.ui.getCore().byId("idVerba").setValue();
			sap.ui.getCore().byId("idDescricao").setValue();
			sap.ui.getCore().byId("idQuantidade").setValue();
			// sap.ui.getCore().byId("idComissao").setValue();
			sap.ui.getCore().byId("idImgProduto").setSrc(that.oItemPedido.pathImg);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal);
			// this.getView().setModel(this.getOwnerComponent().setModel("modelItemPedido").setProperty("/valorTotal", that.oItemPedido.zzVprodDescTotal);
			this.getOwnerComponent().getModel("modelItemPedido").setProperty("/valorTotal", that.oItemPedido.zzVprodDescTotal);
			this.getOwnerComponent().getModel("modelItemPedido").setProperty("/valorUnitario", that.oItemPedido.zzVprodDesc);

		},

		onQuantidadeChange: function (evt) {
			var that = this;
			var open = indexedDB.open("VB_DataBase");

			open.onerror = function () {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function () {
				var db = open.result;

				var store = db.transaction("Materiais", "readwrite");
				var objMaterial = store.objectStore("Materiais");

				var requestMaterial = objMaterial.get(sap.ui.getCore().byId("idItemPedido").getValue());

				requestMaterial.onsuccess = function (e) {
					var oMaterial = e.target.result;

					if (oMaterial === undefined) {

						sap.ui.getCore().byId("idItemPedido").setValue("");

						MessageBox.show("Não existe o produto: " + sap.ui.getCore().byId("idItemPedido").getValue(), {
							icon: MessageBox.Icon.ERROR,
							title: "Produto não encontrado.",
							actions: [MessageBox.Action.YES],
							onClose: function () {
								that.onResetaCamposDialog();
								// sap.ui.getCore().byId("idItemPedido").focus();
							}
						});

					} else {
						var quantidade = sap.ui.getCore().byId("idQuantidade").getValue();

						if (sap.ui.getCore().byId("idQuantidade").getValue() > 0) {

							that.oItemPedido.zzQnt = parseInt(quantidade);
							that.calculaPrecoItem();
							that.popularCamposItemPedido();

						} else {
							MessageBox.show("Quantidade deve ser maior que 0.", {
								icon: MessageBox.Icon.ERROR,
								title: "Quantidade inválida.",
								actions: [MessageBox.Action.OK],
								onClose: function () {
									sap.ui.getCore().byId("idQuantidade").setValue(1);
									sap.ui.getCore().byId("idQuantidade").focus();

								}
							});
						}
					}
				};
			};
		},

		onFocusQnt: function () {
			sap.ui.getCore().byId("idDesconto").focus();
		},

		onDescontoChange: function () {
			var that = this;

			var desconto = sap.ui.getCore().byId("idDesconto").getValue();
			if (desconto === "") {
				desconto = 0;
			}

			if (desconto >= 0) {

				that.oItemPedido.zzDesitem = parseFloat(desconto);
				this.calculaPrecoItem();
				this.popularCamposItemPedido();

			} else {
				MessageBox.show("O desconto não pode ser negativo.", {
					icon: MessageBox.Icon.ERROR,
					title: "Desconto inválida.",
					actions: [MessageBox.Action.OK],
					onClose: function () {

					}
				});
			}
		},

		calculaPrecoItem: function () {
			var that = this;

			//Preço cheio sem descontos
			that.oItemPedido.zzVprodDesc = that.oItemPedido.zzVprod;
			that.oItemPedido.zzVprodDesc = that.oItemPedido.zzVprodDesc - (that.oItemPedido.zzVprodDesc * that.oItemPedido.zzDesitem / 100);

			that.oItemPedido.zzVprodDescTotal = that.oItemPedido.zzVprodDesc * that.oItemPedido.zzQnt;
			that.oItemPedido.zzVprodDescTotal = Math.round(parseFloat(that.oItemPedido.zzVprodDescTotal * 100)) / 100;

		},

		calculaTotalPedido: function () {
			var Qnt = 0;
			var that = this;
			var Ntgew = 0;
			var valorParcelas = 0;
			var TotalPedidoDesc = 0;
			var QntProdutos = 0;
			var Total = 0;

			var quantidadeParcelas = parseInt(this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/QuantParcelas"), 10);
			quantidadeParcelas = (quantidadeParcelas === 0 ? 1 : quantidadeParcelas);

			var tipoPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");

			for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {

				TotalPedidoDesc += that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt;

				Total += that.objItensPedidoTemplate[i].zzVprod * that.objItensPedidoTemplate[i].zzQnt;
				Qnt += that.objItensPedidoTemplate[i].zzQnt;
				QntProdutos += 1;

				if (that.objItensPedidoTemplate[i].ntgew > 0) {
					Ntgew += that.objItensPedidoTemplate[i].ntgew * that.objItensPedidoTemplate[i].zzQnt;
				}
			}

			TotalPedidoDesc = Math.round(parseFloat(TotalPedidoDesc * 100)) / 100;
			console.log("CALCULO DADOS GERAIS");

			//Calculando total de desconto dado.

			// console.log(totalExcedenteDescontosDiluicao);
			// totalExcedenteDescontosDiluicao = Math.round(totalExcedenteDescontosDiluicao * 100) / 100;

			//TOTAIS DO PEDIDO
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TotalItensPedido", Qnt);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotPed", parseFloat(TotalPedidoDesc).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Ntgew", Ntgew);

		},
		/* calculaTotalPedido */

		onPrecoMinPermitido: function (objItensPedidoTemplate) {
			var that = this;

			for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
				var valorProdutoCheio = that.objItensPedidoTemplate[i].zzVprod;

				//VALOR DO PRODUTO INICIAL É DESCONTADO O PERCENTUAL DA TABELA AVISTA QUANDO TIVER
				if (this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao") === "01") {

					valorProdutoCheio = valorProdutoCheio - (valorProdutoCheio * 5 / 100);

				}

				var valorMinPermitido = valorProdutoCheio - (valorProdutoCheio * parseFloat(that.objItensPedidoTemplate[i].maxdescpermitido) / 100);
				valorMinPermitido = valorMinPermitido - (valorMinPermitido * parseFloat(that.objItensPedidoTemplate[i].maxdescpermitidoExtra) /
					100);

				that.objItensPedidoTemplate[i].zzVprodMinPermitido = (valorMinPermitido).toFixed(3);
				console.log("Item :" + that.objItensPedidoTemplate[i].matnr + ", Min Permitido: " + that.objItensPedidoTemplate[i].zzVprodMinPermitido);

			}
		},

		onTablFilterEvent: function (evt) {
			var that = this;
			var item = evt.getParameters();
			var open = indexedDB.open("VB_DataBase");

			open.onerror = function () {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function () {
				var db = open.result;
				var obrigadoSalvar = that.getOwnerComponent().getModel("modelAux").getProperty("/ObrigaSalvar");

				if (obrigadoSalvar === false) {
					MessageBox.show("Salve o pedido !", {
						icon: MessageBox.Icon.ERROR,
						title: "Atenção!",
						actions: [MessageBox.Action.OK],
						onClose: function () {
							that.byId("idTopLevelIconTabBar").setSelectedKey("tab2");
							that.byId("idLiberarItens").focus();
						}
					});
				} else if (that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco") === "" && item.selectedKey === "tab1" &&
					item.selectedKey === "tab2") {
					MessageBox.show("Escolha uma tabela de preço!", {
						icon: MessageBox.Icon.ERROR,
						title: "Preecher campo(s)",
						actions: [MessageBox.Action.OK],
						onClose: function () {
							that.byId("idTopLevelIconTabBar").setSelectedKey("tab2");
							that.byId("idTabelaPreco").focus();
						}
					});
				} else if (item.selectedKey === "tab6") {

					that.calculaTotalPedido();

					that.setaCompleto(db, "Não");

					//Atualiza todos os itens do pedido com as propriedades do vetor total de itens.
					that.onAtualizaTodosItensPedido(db);

				}
			};
		},

		onAtualizaTodosItensPedido: function (db) {
			var that = this;
			var storeItensPedido = db.transaction(["ItensPedido"], "readwrite");
			var objItensPedido = storeItensPedido.objectStore("ItensPedido");

			for (var p = 0; p < that.objItensPedidoTemplate.length; p++) {

				// if (that.objItensPedidoTemplate[p].tipoItem2 === "Diluicao") {

				// 	that.objItensPedidoTemplate[p].zzValExcedidoItem = 0;
				// } else {

				// 	that.objItensPedidoTemplate[p].zzValExcedidoItem = Math.round(that.objItensPedidoTemplate[p].zzValExcedidoItem * 10000) / 10000;
				// }

				// that.objItensPedidoTemplate[p].zzVprodDesc2 = (Math.round(that.objItensPedidoTemplate[p].zzVprodDesc2 * 10000) / 10000);
				that.objItensPedidoTemplate[p].zzVprodDesc = (Math.round(that.objItensPedidoTemplate[p].zzVprodDesc * 10000) / 10000);

				// that.objItensPedidoTemplate[p].zzVprodDesc2 = that.objItensPedidoTemplate[p].zzVprodDesc2.toFixed(4);
				that.objItensPedidoTemplate[p].zzVprodDesc = that.objItensPedidoTemplate[p].zzVprodDesc.toFixed(4);

				var requestADDItem = objItensPedido.put(that.objItensPedidoTemplate[p]);

				requestADDItem.onsuccess = function (e3) {
					console.log("Itens atualizados com sucesso");

				};
				requestADDItem.onerror = function (e3) {
					console.log("Falha ao atualizar os Itens");
				};
			}
		},

		popularCamposItemPedido: function () {
			var that = this;

			sap.ui.getCore().byId("idItemPedido").setValue(that.oItemPedido.matnr);
			sap.ui.getCore().byId("idDescricao").setValue(that.oItemPedido.maktx);
			sap.ui.getCore().byId("idQuantidade").setValue(that.oItemPedido.zzQnt);
			sap.ui.getCore().byId("idDesconto").setValue(that.oItemPedido.zzDesitem);
			this.getOwnerComponent().getModel("modelItemPedido").setProperty("/valorTotal", that.oItemPedido.zzVprodDescTotal);
			this.getOwnerComponent().getModel("modelItemPedido").setProperty("/valorUnitario", that.oItemPedido.zzVprodDesc);
			// sap.ui.getCore().byId("idPrecoUN").setValue(that.oItemPedido.zzVprodDesc);
			// sap.ui.getCore().byId("idVerba").setValue(that.oItemPedido.zzPervm);
			// sap.ui.getCore().byId("idComissao").setValue(that.oItemPedido.zzPercom);
			// sap.ui.getCore().byId("idImgProduto").setSrc(that.oItemPedido.pathImg);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal);
			// this.getView().setModel(this.getOwnerComponent().setModel("modelItemPedido").setProperty("/valorTotal", that.oItemPedido.zzVprodDescTotal);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal.toString().replace(".", ","));

			// this.getView().getModel().setProperty("/precoVenda", 150.2);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal)ç

			var oPanel = sap.ui.getCore().byId("idDialog");
			oPanel.setBusy(false);

		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getSource().getValue();
			var aFilters = [];
			var oFilter = [new sap.ui.model.Filter("matnr", sap.ui.model.FilterOperator.Contains, sValue), new sap.ui.model.Filter(
				"maktx", sap.ui.model.FilterOperator.Contains, sValue)];
			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			sap.ui.getCore().byId("idItemPedido").getBinding("suggestionItems").filter(aFilters);
			sap.ui.getCore().byId("idItemPedido").suggest();
		},

		onDialogCancelButton: function () {
			var that = this;

			if (this._ItemDialog) {
				this._ItemDialog.destroy(true);
			}

			var open = indexedDB.open("VB_DataBase");

			open.onerror = function () {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function () {
				that.objItensPedidoTemplate = [];
				var db = open.result;
				var numeroPedido = that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli");

				var store = db.transaction("ItensPedido").objectStore("ItensPedido");
				store.openCursor().onsuccess = function (event1) {
					var cursor = event1.target.result;

					if (cursor) {
						if (cursor.value.nrPedCli === numeroPedido) {
							that.objItensPedidoTemplate.push(cursor.value);
						}
						cursor.continue();
					} else {

						var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
						that.getView().setModel(oModel, "ItensPedidoGrid");

						that.onBloqueiaPrePedido();
						that.calculaTotalPedido();

						//Clicou no editar item .. mas cancelou .. dai tem que resetar a variavel que identifica que é um edit
						that.getOwnerComponent().getModel("modelAux").setProperty("/EditarindexItem", 0);
					}
				};
			};
		},

		onDialogSubmitButton: function () {

			var that = this;
			var oPanel = sap.ui.getCore().byId("idDialog");
			var itemExistente = false;
			var aux = [];
			var indexEdit = that.getOwnerComponent().getModel("modelAux").getProperty("/EditarindexItem");
			var tipoPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");

			for (var j = 0; j < that.objItensPedidoTemplate.length; j++) {
				if (that.oItemPedido.matnr === that.objItensPedidoTemplate[j].matnr && (
						indexEdit === undefined || indexEdit === 0 || indexEdit === "")) {
					itemExistente = true;
					break;
				}
			}

			if (itemExistente === false) {

				if (indexEdit === undefined) {
					that.getOwnerComponent().getModel("modelAux").setProperty("/EditarindexItem", 0);
					indexEdit = 0;
				}

				var nrPedCli = that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli");
				var oButtonSalvar = sap.ui.getCore().byId("idButtonSalvarDialog");
				oButtonSalvar.setEnabled(false);

				//Define o index do produto a ser inserido
				for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
					if (i === 0) {
						aux = that.objItensPedidoTemplate[i].idItemPedido.split("/");
						that.indexItem = parseInt(aux[1], 10);

					} else if (i > 0) {
						aux = that.objItensPedidoTemplate[i].idItemPedido.split("/");

						if (that.indexItem < parseInt(aux[1], 10)) {
							that.indexItem = parseInt(aux[1], 10);
						}
					}
				}

				if (that.objItensPedidoTemplate.length === 0) {
					that.indexItem = 1;
				} else {
					that.indexItem += 1;
				}

				// if(indexEdit !== "" && indexEdit !== undefined){
				// 	that.indexItem = indexEdit;
				// }

				if (sap.ui.getCore().byId("idItemPedido").getValue() === "") {
					MessageBox.show("Selecione um produto.", {
						icon: MessageBox.Icon.ERROR,
						title: "Falha ao inserir",
						actions: [MessageBox.Action.OK],
						onClose: function () {
							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
						}
					});
				} else if (sap.ui.getCore().byId("idQuantidade").getValue() === "" || sap.ui.getCore().byId("idQuantidade").getValue() === 0) {

					MessageBox.show("Digite uma quantidade acima de 0.", {
						icon: MessageBox.Icon.ERROR,
						title: "Campo Inválido.",
						actions: [MessageBox.Action.OK],
						onClose: function () {
							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
							sap.ui.getCore().byId("idQuantidade").setValue(1);
						}
					});

				} else if (that.oItemPedido.zzDesitem >= 80) {

					MessageBox.show("Desconto não permitido (" + that.oItemPedido.zzDesitem + ")", {
						icon: MessageBox.Icon.ERROR,
						title: "Quantidade de desconto inválida.",
						actions: [MessageBox.Action.OK],
						onClose: function () {

							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
							sap.ui.getCore().byId("idQuantidade").setValue(1);

						}
					});

				} else if (that.oItemPedido.zzVprodDesc < that.oItemPedido.zzVprodMin) {

					MessageBox.show("Valor do produto não permitido. Valor mínimo permitido: R$: " + that.oItemPedido.zzVprodMin, {
						icon: MessageBox.Icon.ERROR,
						title: "Quantidade de desconto inválida.",
						actions: [MessageBox.Action.OK],
						onClose: function () {

							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
							// sap.ui.getCore().byId("idQuantidade").setValue(1);

						}
					});

				} else {
					var open = indexedDB.open("VB_DataBase");

					open.onerror = function () {
						oButtonSalvar.setEnabled(true);
						MessageBox.show(open.error.mensage, {
							icon: MessageBox.Icon.ERROR,
							title: "Banco não encontrado!",
							actions: [MessageBox.Action.OK]
						});
					};

					open.onsuccess = function () {
						var db = open.result;

						that.onAddItemVetor(db, oPanel, indexEdit, nrPedCli, oButtonSalvar);

					};
				}
			} else {
				MessageBox.show("Produto: " + that.oItemPedido.matnr + " já inserido na lista de itens!", {
					icon: MessageBox.Icon.ERROR,
					title: "Produto já inserido.",
					actions: [MessageBox.Action.YES],
					onClose: function () {
						that.onResetaCamposDialog();
						sap.ui.getCore().byId("idItemPedido").setValue();
						sap.ui.getCore().byId("idItemPedido").focus();
						oPanel.setBusy(false);
					}
				});
			}
		},

		onAddItemVetor: function (db, oPanel, indexEdit, nrPedCli, oButtonSalvar) {
			var that = this;
			var store = db.transaction("Materiais", "readwrite");
			var objMaterial = store.objectStore("Materiais");

			var requestMaterial = objMaterial.get(sap.ui.getCore().byId("idItemPedido").getValue());

			requestMaterial.onsuccess = function (e) {
				var oMaterial = e.target.result;

				if (oMaterial === undefined) {
					oPanel.setBusy(false);

					MessageBox.show("Não existe o produto: " + sap.ui.getCore().byId("idItemPedido").getValue(), {
						icon: MessageBox.Icon.ERROR,
						title: "Produto não encontrado.",
						actions: [MessageBox.Action.YES],
						onClose: function () {
							that.onResetaCamposDialog();
							sap.ui.getCore().byId("idItemPedido").focus();
							oButtonSalvar.setEnabled(true);
						}
					});

				} else {

					var storeItensPedido = db.transaction(["ItensPedido"], "readwrite");
					var objItensPedido = storeItensPedido.objectStore("ItensPedido");

					// indexEdit inicia com 0, só é populado quando clica para editar 1 item. Senão sempre vai adicionar novo item
					var request = objItensPedido.get(indexEdit);

					request.onsuccess = function (e3) {

						var result2 = e3.target.result;

						//preparar o obj a ser adicionado ou editado
						if (result2 === undefined) {

							that.getOwnerComponent().getModel("modelAux").setProperty("/UltimoindexItem", nrPedCli + "/" + (that.indexItem));
							that.oItemPedido.idItemPedido = that.getOwnerComponent().getModel("modelAux").getProperty("/UltimoindexItem");
							that.oItemPedido.index = that.indexItem;
							that.oItemPedido.nrPedCli = nrPedCli;

							that.objItensPedidoTemplate.push(that.oItemPedido);
							console.log("Item: " + that.oItemPedido.index + " adicionado com sucesso");
						} else {
							//OBJ ENCONTRADO NO BANCO... ATUALIZA ELE.
							that.oItemPedido.idItemPedido = that.getOwnerComponent().getModel("modelAux").getProperty("/EditarindexItem");

							for (var j = 0; j < that.objItensPedidoTemplate.length; j++) {
								if (that.objItensPedidoTemplate[j].idItemPedido === that.oItemPedido.idItemPedido) {
									that.objItensPedidoTemplate[j] = that.oItemPedido;
								}
							}
							console.log("Item: " + that.oItemPedido.index + " foi Atualizado");
						}

						storeItensPedido = db.transaction(["ItensPedido"], "readwrite");
						objItensPedido = storeItensPedido.objectStore("ItensPedido");

						var requestPutItens = objItensPedido.put(that.oItemPedido);

						requestPutItens.onsuccess = function () {

							that.setaCompleto(db, "Não");
							that.calculaTotalPedido();
							that.onAtualizaTodosItensPedido(db);
							that.oItemTemplate = [];

							if (that._ItemDialog) {
								that._ItemDialog.destroy(true);
							}

							oButtonSalvar.setEnabled(true);
							that.getOwnerComponent().getModel("modelAux").setProperty("/EditarindexItem", 0);

							var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
							that.getView().setModel(oModel, "ItensPedidoGrid");
							that.onBloqueiaPrePedido();
						};

						requestPutItens.onerror = function (event) {
							console.log(" Dados itensPedido não foram inseridos");

							oButtonSalvar.setEnabled(true);

							if (that._ItemDialog) {
								that._ItemDialog.destroy(true);
							}
						};
					};
				}
			};
		},
		
		onDialogDiluicaoSubmitButton: function () {

			var that = this;

			var nrPedCli = that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli");
			var tipoPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");
			var oPanel = sap.ui.getCore().byId("idDialog");
			var oButtonSalvar = sap.ui.getCore().byId("idButtonSalvarDiluicaoDialog");
			oButtonSalvar.setEnabled(false);
			var itemJaInseridoDiluicao = false;

			for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {

				if (that.objItensPedidoTemplate[i].matnr === that.oItemPedido.matnr && that.objItensPedidoTemplate[i].tipoItem === "Diluicao") {
					itemJaInseridoDiluicao = true;
					break;
				}
			}

			if (itemJaInseridoDiluicao === true) {

				MessageBox.show("Item de diluição já inserido!", {
					icon: MessageBox.Icon.ERROR,
					title: "Item inválido.",
					actions: [MessageBox.Action.OK],
					onClose: function () {
						oButtonSalvar.setEnabled(true);
						that.onResetaCamposDialog();
						sap.ui.getCore().byId("idItemPedido").setValue();
						sap.ui.getCore().byId("idItemPedido").focus();
						oPanel.setBusy(false);
						itemJaInseridoDiluicao = false;

					}
				});

			} else {

				that.indexItem = this.onCriarIndexItemPedido();

				if (sap.ui.getCore().byId("idItemPedido").getValue() === "") {
					MessageBox.show("Selecione um produto.", {
						icon: MessageBox.Icon.ERROR,
						title: "Falha ao inserir",
						actions: [MessageBox.Action.OK],
						onClose: function () {
							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
						}
					});
				} else if (sap.ui.getCore().byId("idQuantidade").getValue() === "" || sap.ui.getCore().byId("idQuantidade").getValue() === 0) {

					MessageBox.show("Digite uma quantidade acima de 0.", {
						icon: MessageBox.Icon.ERROR,
						title: "Campo Inválido.",
						actions: [MessageBox.Action.OK],
						onClose: function () {
							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
							sap.ui.getCore().byId("idQuantidade").setValue(that.oItemTemplate.QtdPedida);

						}
					});

				} else if (that.oItemPedido.aumng != 0 && (that.oItemPedido.zzQnt % that.oItemPedido.aumng) != 0 && tipoPedido != "YTRO") {

					MessageBox.show("Digite uma quantidade multipla de " + that.oItemPedido.aumng, {
						icon: MessageBox.Icon.ERROR,
						title: "Quantidade Inválida.",
						actions: [MessageBox.Action.OK],
						onClose: function () {

							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
							sap.ui.getCore().byId("idQuantidade").setValue(1);

						}
					});

				} else {
					var open = indexedDB.open("VB_DataBase");

					open.onerror = function () {

						MessageBox.show(open.error.mensage, {
							icon: MessageBox.Icon.ERROR,
							title: "Banco não encontrado!",
							actions: [MessageBox.Action.OK],
							onClose: function () {
								oButtonSalvar.setEnabled(true);
							}
						});
					};

					open.onsuccess = function () {
						var db = open.result;

						var store = db.transaction("Materiais", "readwrite");
						var objMaterial = store.objectStore("Materiais");

						var requestMaterial = objMaterial.get(sap.ui.getCore().byId("idItemPedido").getValue());

						requestMaterial.onsuccess = function (e) {
							var oMaterial = e.target.result;

							if (oMaterial === undefined) {
								oPanel.setBusy(false);

								MessageBox.show("Não existe o produto: " + sap.ui.getCore().byId("idItemPedido").getValue(), {
									icon: MessageBox.Icon.ERROR,
									title: "Produto não encontrado.",
									actions: [MessageBox.Action.YES],
									onClose: function () {
										that.onResetaCamposDialog();
										sap.ui.getCore().byId("idItemPedido").focus();
										oButtonSalvar.setEnabled(true);
									}
								});

							} else {

								var storeItensPedido = db.transaction(["ItensPedido"], "readwrite");
								var objItensPedido = storeItensPedido.objectStore("ItensPedido");

								that.getOwnerComponent().getModel("modelAux").setProperty("/UltimoindexItem", nrPedCli + "/" + (that.indexItem));
								that.oItemPedido.idItemPedido = that.getOwnerComponent().getModel("modelAux").getProperty("/UltimoindexItem");
								that.oItemPedido.index = that.indexItem;
								that.oItemPedido.nrPedCli = nrPedCli;
								var requestADDItem = objItensPedido.add(that.oItemPedido);
								requestADDItem.onsuccess = function (e3) {

									that.objItensPedidoTemplate.push(that.oItemPedido);
									// that.indexItem = that.indexItem + 1;
									that.setaCompleto(db, "Não");

									var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
									that.getView().setModel(oModel, "ItensPedidoGrid");

									that.onBloqueiaPrePedido();

									that.byId("idDiluirItens").setEnabled(true);

									console.log("Item: " + that.oItemPedido.index + " adicionado com sucesso, tipo Item: " + that.oItemPedido.tipoItem);

									that.calculaTotalPedido();

								};
								requestADDItem.onerror = function (e3) {
									oButtonSalvar.setEnabled(true);
									console.log("Falha ao adicionar o Item: " + that.oItemPedido.index);
								};

								if (that._ItemDialog) {
									that._ItemDialog.destroy(true);
									oButtonSalvar.setEnabled(true);
								}
							}
						};
					};
				}
			}
		},

		// FIM DOS DADOS FRAGMENTO

		// EVENTOS DA TABLE 						<<<<<<<<<<<<
		onNovoItem: function () {
			console.log("onitempress standard");
			var that = this;

			var statusPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			var tipoPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");
			that.oItemPedido = [];

			if (statusPedido === 3 || statusPedido === 2 || statusPedido === 9) {
				MessageBox.show("Este pedido não pode mais ser alterado", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK]
				});
			} else {

				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}

				if (!this._CreateMaterialFragment) {

					this._ItemDialog = sap.ui.xmlfragment(
						"testeui5.view.ItemDialog",
						this
					);

					this.getView().addDependent(this._ItemDialog);
				}

				/*set model para o dialog*/
				this._ItemDialog.open();
				sap.ui.getCore().byId("idItemPedido").focus();
				this.getOwnerComponent().getModel("modelItemPedido").setProperty("/valorTotal", 0);
				this.getOwnerComponent().getModel("modelItemPedido").setProperty("/valorUnitario", 0);
			}
		},

		onEditarItemPress: function (oEvent) {
			var that = this;
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			var statusPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			//VARIAVEL QUE MOSTRA UM ITEM ESTÁ SENDO EDITADO
			var itemPedido = oItem.getBindingContext("ItensPedidoGrid").getProperty("idItemPedido");
			that.getOwnerComponent().getModel("modelAux").setProperty("/EditarindexItem", itemPedido);
			var tipoPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");

			if (statusPedido === 3 || statusPedido === 2 || statusPedido === 9) {

				MessageBox.show("Este pedido não pode mais ser alterado", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK]
				});

			} else {
				//TO DO SETAR TODOS OS CAMPOS COM OS DADOS DO that.oItemTemplate  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {

					if (that.objItensPedidoTemplate[i].idItemPedido === itemPedido) {
						that.oItemPedido = that.objItensPedidoTemplate[i];
					}
				}

				if (that._ItemDialog) {
					that._ItemDialog.destroy(true);
				}

				that._ItemDialog = sap.ui.xmlfragment(
					"testeui5.view.ItemDialog",
					that
				);
				that.getView().addDependent(that._ItemDialog);

				that._ItemDialog.setModel(that.getView().getModel());
				that._ItemDialog.open();
				that.popularCamposItemPedido();

				if (that.oItemPedido.tipoItem === "Diluicao" | tipoPedido === "YBON" | tipoPedido === "YTRO") {
					sap.ui.getCore().byId("idDesconto").setEnabled(false);
				} else {
					sap.ui.getCore().byId("idDesconto").setEnabled(true);
				}

				sap.ui.getCore().byId("idItemPedido").setEnabled(false);

				if (that.oItemPedido.tipoItem === "Diluido") {
					sap.ui.getCore().byId("idItemPedido").setEnabled(false);
					sap.ui.getCore().byId("idQuantidade").setEnabled(false);
					sap.ui.getCore().byId("idDesconto").setEnabled(false);
				}
			}
		},

		onDeletarItemPedido: function (oEvent) {
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			var idItemPedido = oItem.getBindingContext("ItensPedidoGrid").getProperty("idItemPedido");
			var idItem = oItem.getBindingContext("ItensPedidoGrid").getProperty("matnr");
			var statusPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			if (statusPedido === 3 || statusPedido === 2 || statusPedido === 9) {

				MessageBox.show("Este pedido não pode mais ser alterado", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK]
				});

			} else {
				var that = this;
				MessageBox.show("Deseja excluir o item " + idItem + "?", {
					icon: MessageBox.Icon.WARNING,
					title: "Exclusão de Item!",
					actions: ["Excluir", "Cancelar"],
					onClose: function (oAction) {
						if (oAction === "Excluir") {

							for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
								if (that.objItensPedidoTemplate[i].idItemPedido === idItemPedido) {

									that.objItensPedidoTemplate.splice(i, 1);

									if (that.objItensPedidoTemplate.length === 0) {

										that.byId("idTabelaPreco").setProperty("enabled", true);
										that.byId("idFormaPagamento").setProperty("enabled", true);
										that.byId("idInserirItem").setEnabled(true);

									}
								}
							}
							var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
							that.getView().setModel(oModel, "ItensPedidoGrid");

							that.onBloqueiaPrePedido();

							var open = indexedDB.open("VB_DataBase");
							open.onerror = function () {
								MessageBox.show(open.error.mensage, {
									icon: MessageBox.Icon.ERROR,
									title: "Banco não encontrado!",
									actions: [MessageBox.Action.OK]
								});
							};

							open.onsuccess = function () {
								var db = open.result;

								that.setaCompleto(db, "Não");
								that.calculaTotalPedido();

								var store1 = db.transaction("ItensPedido", "readwrite");
								var objPedido = store1.objectStore("ItensPedido");

								var request = objPedido.delete(idItemPedido);
								request.onsuccess = function () {
									console.log("Item com ID: " + idItemPedido + " foi deletado!");
								};
								request.onerror = function () {
									console.log("ERRO!! Item: " + idItemPedido + "Não foi deletado!");
								};
							};
						}
					}
				});
			}
		},

		// FIM EVENTOS DA TABLe

		// EVENTOS DOS BOTÕES 						<<<<<<<<<<<<

		onFinalizarPedido: function () {

			//Percorre os itens do pesdido para fazer uma verificação se realmente não tem produto repetido.
			var that = this;
			var idStatusPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			var codCliente = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");

			if (idStatusPedido === 3 || idStatusPedido === 2) {

				MessageBox.show("Este pedido não pode mais ser alterado", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK]
				});

			}
			// else if (valorParcelas < 300 && formaPagamento === "D" && tipoPedido != "U") {

			// 	MessageBox.show("Pedido deve ter um parcelamento maior que R$: 300,00.", {
			// 		icon: MessageBox.Icon.WARNING,
			// 		title: "Não Permitido",
			// 		actions: [MessageBox.Action.OK]
			// 	});

			// } 
			else if (codCliente === undefined || codCliente === "") {

				MessageBox.show("Esse pedido está sem cliente. Retorne no menu de pedidos e escolha o cliente novamente.", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK],
					onClose: function () {
						sap.ui.core.UIComponent.getRouterFor(that).navTo("pedido");
					}
				});

			} else {

				//HRIMP E DATIMP
				var data = this.onDataAtualizacao();
				var horario = data[1];

				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/SituacaoPedido", "Pendente");
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IdStatusPedido", 2);

				var totalItens = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TotalItensPedido");
				var completoPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Completo");
				if (totalItens <= 0 || totalItens === undefined) {
					MessageBox.show("O pedido deve conter no mínimo 1 item.", {
						icon: MessageBox.Icon.ERROR,
						title: "Falha ao Completar Pedido.",
						actions: [MessageBox.Action.OK]
					});
				}
				// else if (itemDuplicado === true) {
				// 	MessageBox.show("O pedido possui itens duplicados. Favor rever sua lista de itens!", {
				// 		icon: MessageBox.Icon.ERROR,
				// 		title: "Falha ao Completar Pedido.",
				// 		actions: [MessageBox.Action.OK]
				// 	});
				// } 
				else {
					//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Atualizando o PrePedido PEDIDO NO BANCO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
					var open = indexedDB.open("VB_DataBase");

					open.onerror = function () {
						MessageBox.show(open.error.mensage, {
							icon: MessageBox.Icon.ERROR,
							title: "Falha ao abrir o banco para inserir os dados do pedido!",
							actions: [MessageBox.Action.OK]
						});
					};

					open.onsuccess = function () {
						var db = open.result;

						if (completoPedido === "Não") {
							
							var objBancoPrePedido = {
								nrPedCli: that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"),
								vkorg: that.getOwnerComponent().getModel("modelCliente").getProperty("/Vkorg"),
								vtweg: that.getOwnerComponent().getModel("modelCliente").getProperty("/Vtweg"),
								spart: that.getOwnerComponent().getModel("modelCliente").getProperty("/Spart"),
								kunnr: that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr"),
								werks: that.getOwnerComponent().getModel("modelAux").getProperty("/Werks"),
								codRepres: that.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres"),
								tipoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido"),
								idStatusPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido"),
								/* Forço o status para finalizado */
								situacaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/SituacaoPedido"),
								tabPreco: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco"),
								completo: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Completo"),
								dataPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DataPedido"),
								dataImpl: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DataImpl"),
								observacaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ObservacaoPedido"),
								ntgew: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Ntgew"),
								valTotPed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotPed"),
								totalItensPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TotalItensPedido"),
								codUsr: that.getOwnerComponent().getModel("modelAux").getProperty("/CodUsr"),
								tipoUsuario: that.getOwnerComponent().getModel("modelAux").getProperty("/Tipousuario"),
								zlsch: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/FormaPagamento")
							};

							var store1 = db.transaction("PrePedidos", "readwrite");
							var objPedido = store1.objectStore("PrePedidos");
							var request = objPedido.put(objBancoPrePedido);

							request.onsuccess = function () {
								// that.atualizaMovtoVerba(db);
								that.setaCompleto(db, "Sim");
								that.onResetarCamposPrePedido();
								that.oItemTemplate = [];
								console.log("Pedido inserido");
							};

							request.onerror = function () {
								console.log("Pedido não foi Inserido!");
							};
						}

						MessageBox.show("Deseja enviar o pedido agora ?", {
							icon: MessageBox.Icon.ERROR,
							title: "Atenção",
							actions: [MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function (oAction) {
								if (oAction === sap.m.MessageBox.Action.YES) {
									that.getOwnerComponent().getModel("modelAux").setProperty("/bEnviarPedido", true);
									sap.ui.core.UIComponent.getRouterFor(that).navTo("enviarPedidos");
									that.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
								}
								if (oAction === sap.m.MessageBox.Action.NO) {
									that.getOwnerComponent().getModel("modelAux").setProperty("/bEnviarPedido", true);
									sap.ui.core.UIComponent.getRouterFor(that).navTo("pedido");
									that.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
								}
							}
						});
					};
				}
			}
		},

		onLiberarItensPedido: function () {
			var that = this;

			var idStatusPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			var codCliente = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");

			if (idStatusPedido === 3 || idStatusPedido === 2) {

				MessageBox.show("Este pedido não pode mais ser alterado", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK]
				});

			} else if (codCliente === undefined || codCliente === "") {

				MessageBox.show("Esse pedido está sem cliente. Retorne no menu de pedidos e escolha o cliente novamente.", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK],
					onClose: function () {
						sap.ui.core.UIComponent.getRouterFor(that).navTo("pedido");
					}
				});

			} else {
				var date = new Date();
				this.getOwnerComponent().getModel("modelAux").setProperty("/ObrigaSalvar", true);

				if (this.byId("idTipoPedido").getSelectedKey() === "" || this.byId("idTipoPedido").getSelectedKey() === undefined) {
					MessageBox.show("Preencher o tipo do pedido!", {
						icon: MessageBox.Icon.ERROR,
						title: "Corrigir o campo!",
						actions: [MessageBox.Action.OK]
					});
				} else if (this.byId("idTabelaPreco").getSelectedKey() === "" || this.byId("idTabelaPreco").getSelectedKey() === undefined) {
					MessageBox.show("Preencher a tabela de preço!", {
						icon: MessageBox.Icon.ERROR,
						title: "Corrigir o campo!",
						actions: [MessageBox.Action.OK]
					});
				} else if (this.byId("idFormaPagamento").getSelectedKey() === "" || this.byId("idFormaPagamento").getSelectedKey() === undefined) {
					MessageBox.show("Preencher a forma de pagamento!", {
						icon: MessageBox.Icon.ERROR,
						title: "Corrigir o campo!",
						actions: [MessageBox.Action.OK]
					});
				} else {
					// that.objItensPedidoTemplate = [];
					// var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
					// this.getView().setModel(oModel, "ItensPedidoGrid");

					this.byId("tabItensPedidoStep").setProperty("enabled", true);
					this.byId("tabTotalStep").setProperty("enabled", true);
					// this.byId("tabBalancoVerbaStep").setProperty("enabled", true);
					// this.byId("tabItensDiluicaoPedidoStep").setProperty("enabled", true);

					var open = indexedDB.open("VB_DataBase");
					open.onerror = function (hxr) {
						console.log("falha abrir tabela PrePedido as tabelas");
					};
					//Load tables
					open.onsuccess = function () {
						var db = open.result;

						var tx = db.transaction("PrePedidos", "readwrite");
						var objPrePedido = tx.objectStore("PrePedidos");

						var request = objPrePedido.get(that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"));

						request.onsuccess = function (e) {
							var result = e.target.result;

							var objBancoPrePedido = {
								nrPedCli: that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"),
								vkorg: that.getOwnerComponent().getModel("modelCliente").getProperty("/Vkorg"),
								vtweg: that.getOwnerComponent().getModel("modelCliente").getProperty("/Vtweg"),
								spart: that.getOwnerComponent().getModel("modelCliente").getProperty("/Spart"),
								kunnr: that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr"),
								werks: that.getOwnerComponent().getModel("modelAux").getProperty("/Werks"),
								codRepres: that.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres"),
								tipoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido"),
								idStatusPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido"),
								situacaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/SituacaoPedido"),
								tabPreco: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco"),
								completo: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Completo"),
								// valMinPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValMinPedido"),
								dataPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DataPedido"),
								dataImpl: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DataImpl"),
								codUsr: that.getOwnerComponent().getModel("modelAux").getProperty("/CodUsr"),
								tipoUsuario: that.getOwnerComponent().getModel("modelAux").getProperty("/Tipousuario"),
								zlsch: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/FormaPagamento"),
								ntgew: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Ntgew"),
								valTotPed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotPed"),
								observacaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ObservacaoPedido"),
								totalItensPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TotalItensPedido")
							};

							//ADICIONAR O OBJ .. QND FOR UNDEFINED, POIS O OBJ NÃO FOI ENCONTRADO, ESTÁ VAZIO.
							if (result === undefined || result === null) {

								var request1 = objPrePedido.add(objBancoPrePedido);
								request1.onsuccess = function () {

									that.setaCompleto(db, "Não");

									MessageBox.show("Inclusão Efetivada com Sucesso!", {
										icon: MessageBox.Icon.SUCCESS,
										title: "Confirmação",
										actions: [MessageBox.Action.OK],
										onClose: function () {
											that.byId("idTopLevelIconTabBar").setSelectedKey("tab3");
											console.log("Dados PrePedido inseridos");
										}
									});
								};

								request1.onerror = function (event) {
									console.log("Dados PrePedido não foram inseridos :" + event.Message);
								};

							} else {

								request1 = objPrePedido.put(objBancoPrePedido);
								
								request1.onsuccess = function () {
									that.setaCompleto(db, "Não");
									
									MessageBox.show("Cabeçalho atualizado com Sucesso!", {
										icon: MessageBox.Icon.SUCCESS,
										title: "Concluido!",
										actions: [MessageBox.Action.OK],
										onClose: function () {
											that.byId("idTopLevelIconTabBar").setSelectedKey("tab3");
											console.log("Dados PrePedido Atualizados");
										}
									});
								};

								request1.onerror = function (event) {
									console.log("Dados PrePedido não foram Atualizados :" + event.Message);
								};
							}
						};

						request.onerror = function (e) {
							console.log("Error");
							console.dir(e);
						};
					};
				}
			}
		},

		onResetarCamposPrePedido: function () {

			this.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
			this.getOwnerComponent().getModel("modelAux").setProperty("/Kunnr", "");
			this.getOwnerComponent().getModel("modelAux").setProperty("/idFiscalCliente", "");

			this.onResetaCamposPrePedido();
		},

		onCancelarPedido: function () {
			var that = this;

			this.onResetarCamposPrePedido();
			that.oItemTemplate = [];

			sap.ui.core.UIComponent.getRouterFor(this).navTo("pedido");
		},

		onBloqueiaPrePedidoTotal: function (habilitado) {

			this.byId("idTabelaPreco").setEnabled(habilitado);
			this.byId("idFormaPagamento").setEnabled(habilitado);
			this.byId("idTipoPedido").setEnabled(habilitado);
			this.byId("idInserirItem").setEnabled(habilitado);
			// this.byId("idTipoTransporte").setEnabled(habilitado);
			// this.byId("idTipoNegociacao").setEnabled(habilitado);
			// this.byId("idPrimeiraParcela").setEnabled(habilitado);
			// this.byId("idQuantParcelas").setEnabled(habilitado);
			// this.byId("idIntervaloParcelas").setEnabled(habilitado);
			// this.byId("idValorEntrada").setEnabled(habilitado);
			// this.byId("idPercEntrada").setEnabled(habilitado);
			// this.byId("idInserirItemDiluicao").setEnabled(habilitado);
			// this.byId("idObservacoesAuditoria").setEnabled(habilitado);
			// this.byId("idObservacoes").setEnabled(habilitado);

			//Balanço verbas.
			// this.byId("idVerbaUtilizadaDesconto").setEnabled(habilitado);
			// this.byId("idComissaoUtilizadaDesconto").setEnabled(habilitado);
			// this.byId("idVerbaUtilizadaPrazo").setEnabled(habilitado);
			// this.byId("idComissaoUtilizadaPrazo").setEnabled(habilitado);
			// this.byId("idVerbaUtilizadaBrinde").setEnabled(habilitado);
			// this.byId("idComissaoUtilizadaBrinde").setEnabled(habilitado);
			// this.byId("idVerbaUtilizadaAmostra").setEnabled(habilitado);
			// this.byId("idComissaoUtilizadaAmostra").setEnabled(habilitado);
			// this.byId("idVerbaUtilizadaBonif").setEnabled(habilitado);
			// this.byId("idComissaoUtilizadaBonif").setEnabled(habilitado);			

			/* Regra: 20190308 - A campanha enxoval será imposta, obrigatória o uso, por isso o campo ficará sempre bloqueado. */
			// this.byId("idVerbaEnxoval").setEnabled(habilitado);

			// this.byId("idValCampProdAcabado").setEnabled(habilitado);
			// this.byId("idValCampGlobal").setEnabled(habilitado);
		},

		onBloqueiaPrePedido: function () {
			var that = this;

			var tipoPed = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");

			// for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
			// 	if (that.objItensPedidoTemplate[i].tipoItem === "Diluicao") {
			// 		this.byId("idDiluirItens").setEnabled(true);
			// 		this.byId("idInserirItemDiluicao").setEnabled(true);
			// 		break;
			// 	} else if (that.objItensPedidoTemplate[i].tipoItem === "Diluido") {
			// 		this.byId("idDiluirItens").setEnabled(false);
			// 		this.byId("idInserirItemDiluicao").setEnabled(false);
			// 		this.byId("idInserirItem").setEnabled(false);
			// 		break;
			// 	}
			// }

			if (that.objItensPedidoTemplate.length > 0) {
				this.byId("idTabelaPreco").setEnabled(false);
				this.byId("idFormaPagamento").setEnabled(false);
				this.byId("idTipoPedido").setEnabled(false);
				// this.byId("idTipoTransporte").setEnabled(false);
				// this.byId("idTipoNegociacao").setEnabled(false);

			} else {

				this.byId("idTabelaPreco").setEnabled(true);
				this.byId("idFormaPagamento").setEnabled(true);
				this.byId("idTipoPedido").setEnabled(true);
				this.byId("idInserirItem").setEnabled(true);
				// this.byId("idTipoTransporte").setEnabled(true);
				// this.byId("idTipoNegociacao").setEnabled(true);
				// this.byId("idPrimeiraParcela").setEnabled(true);
				// this.byId("idQuantParcelas").setEnabled(true);
				// this.byId("idIntervaloParcelas").setEnabled(true);
				// this.byId("idValorEntrada").setEnabled(true);
				// this.byId("idPercEntrada").setEnabled(true);
				// this.byId("idInserirItemDiluicao").setEnabled(true);
			}

			// if (tipoPed === "YTRO") {
			// 	this.byId("idInserirItemDiluicao").setEnabled(false);
			// } else if (tipoPed === "YBON") {
			// 	this.byId("idInserirItemDiluicao").setEnabled(false);
			// }
		},

		// FIM EVENTOS DOS BOTÕES 					

		setaCompleto: function (db, completo) {
			var that = this;
			var objSetaCompletoPedido = [];
			that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Completo", completo);

			var tx = db.transaction("PrePedidos", "readwrite");
			var objPrePedido = tx.objectStore("PrePedidos");

			var request = objPrePedido.get(that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"));

			request.onsuccess = function (e) {
				var result = e.target.result;
				objSetaCompletoPedido = result;
				objSetaCompletoPedido.completo = completo;

				var store1 = db.transaction("PrePedidos", "readwrite");
				var objPedido = store1.objectStore("PrePedidos");
				var request1 = objPedido.put(objSetaCompletoPedido);

				request1.onsuccess = function () {
					console.log("O campo completo foi atualizado para > " + completo);
				};
				request1.onerror = function () {
					console.log("Erro ao abrir o Pedido > " + that.getOwnerComponent().getModel("modelAux").getProperty("/nrPedCli"));
				};
			};
		}
	});
});