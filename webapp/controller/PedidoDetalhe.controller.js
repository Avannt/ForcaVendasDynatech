/*eslint-disable no-console, no-alert */
sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"testeui5/model/formatter"
], function(BaseController, JSONModel, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("testeui5.controller.PedidoDetalhe", {

		formatter: formatter,
		
		onInit: function() {
			this.getRouter().getRoute("pedidoDetalhe").attachPatternMatched(this._onLoadFields, this);
		},

		_onLoadFields: function() {
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

			open.onerror = function() {
				MessageBox.show("Não foi possivel fazer leitura do Banco Interno.", {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;

				var promise = new Promise(function(resolve, reject) {
					that.onCarregaCampos(db);
					resolve();
				});

				promise.then(function(value) {
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

		formatNumber: function(value) {
			return value.toLocaleString("pt-BR");
		},

		// onCarregaCliente: function() {

		// 	// var sTipoUsuario = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");
		// 	var sTipoUsuario = this.getOwnerComponent().getModel("modelAux").getProperty("/Tipousuario");

		// 	this.byId("idCodCliente").setValue(this.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr") + "-" +
		// 		this.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres"));
		// 	// this.byId("idNome").setValue(this.getOwnerComponent().getModel("modelCliente").getProperty("/Name1"));
		// 	// this.byId("idCNPJ").setValue(this.getOwnerComponent().getModel("modelCliente").getProperty("/Stcd1") + this.getOwnerComponent().getModel("modelCliente").getProperty("/Stcd2"));
		// 	// this.byId("idEndereco").setValue(this.getOwnerComponent().getModel("modelCliente").getProperty("/Stras"));
		// 	// this.byId("idCidade").setValue(this.getOwnerComponent().getModel("modelCliente").getProperty("/Ort01") + "-" +
		// 	// 	this.getOwnerComponent().getModel("modelCliente").getProperty("/Regio"));
		// 	// this.byId("idFone").setValue(this.getOwnerComponent().getModel("modelCliente").getProperty("/Telf1"));
		// },

		onResetaCamposPrePedido: function() {
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
		onCarregaCampos: function(db, resolve, reject) {
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

			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/SituacaoPedido", "EM DIGITAÇÃO");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IdStatusPedido", 1);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataImpl", data[0] + "-" + data[1]);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataPedido", data[0]);

			//Tipos Pedidos
			var transactionTiposPedidos = db.transaction("TiposPedidos", "readonly");
			var objectStoreTiposPedidos = transactionTiposPedidos.objectStore("TiposPedidos");

			if ("getAll" in objectStoreTiposPedidos) {
				objectStoreTiposPedidos.getAll().onsuccess = function(event) {
					that.oVetorTiposPedidos = event.target.result;

					var oModel = new sap.ui.model.json.JSONModel(that.oVetorTiposPedidos);
					that.getView().setModel(oModel, "tiposPedidos");
				};
			}
			
			// //Tipos Pedidos
			// var transactionA950 = db.transaction("A950", "readonly");
			// var objectStoreA950 = transactionA950.objectStore("A950");

			// if ("getAll" in objectStoreA950) {
			// 	objectStoreA950.getAll().onsuccess = function(event) {
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
				objectStoreFormasPagamentos.getAll().onsuccess = function(event) {
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
			// (Pra essa pesquisa, kozgf == "ZPR0" é para o preço cheio do produto)
			// (Pra essa pesquisa, kozgf == "ZPRMIN" é para o preço minimo do produto)
			var requestOrdensTabPreco = objOrdensTabPreco.getAll();

			requestOrdensTabPreco.onsuccess = function(e) {
				var oOrdensTabPreco = e.target.result;

				//validação feita para ver se a tabela de seq tab preço está cadastrada
				if (oOrdensTabPreco !== undefined) {
					
					for(var i = 0; i < oOrdensTabPreco.length; i ++){
						if(oOrdensTabPreco[i].kozgf === "ZPR0"){
							that.oVetorSeqPrecoMax.push(oOrdensTabPreco[i]);
						} else if(oOrdensTabPreco[i].kozgf === "ZMIN"){
							that.oVetorSeqPrecoMin.push(oOrdensTabPreco[i]);
						}
					}
				}
			};
			
			var transactionA950 = db.transaction("A950", "readonly");
			var objectStoreA950 = transactionA950.objectStore("A950");
			
			if ("getAll" in objectStoreA950) {
				objectStoreA950.getAll().onsuccess = function(event) {
					that.oVetorA950 = event.target.result;
				};
			}
			
			var transactionA406 = db.transaction("A406", "readonly");
			var objectStoreA406 = transactionA406.objectStore("A406");
			
			if ("getAll" in objectStoreA406) {
				objectStoreA406.getAll().onsuccess = function(event) {
					that.oVetorA406 = event.target.result;
				};
			}
			
			var transactionA900 = db.transaction("A900", "readonly");
			var objectStoreA900 = transactionA900.objectStore("A900");
			
			if ("getAll" in objectStoreA900) {
				objectStoreA900.getAll().onsuccess = function(event) {
					that.oVetorA900 = event.target.result;
				};
			}
			
			var transactionTabPreco = db.transaction("TabPreco", "readonly");
			var objectStoreTabPreco = transactionTabPreco.objectStore("TabPreco");
			
			if ("getAll" in objectStoreTabPreco) {
				objectStoreTabPreco.getAll().onsuccess = function(event) {
					that.oVetorTabPreco = event.target.result;

					oModel = new sap.ui.model.json.JSONModel(that.oVetorTabPreco);
					that.getView().setModel(oModel, "tabPreco");
				};
			}
		},

		onCriarNumeroPedido: function() {
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

			if (dia.length == 1) {
				dia = "0" + String(dia);
			}

			if (mes.length == 1) {
				mes = "0" + String(mes);
			}

			if (minuto.length == 1) {
				minuto = "0" + String(minuto);
			}
			if (hora.length == 1) {
				hora = "0" + String(hora);
			}
			if (seg.length == 1) {
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

		onCarregaDadosPedido: function(db) {

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

			requestPrePedidos.onsuccess = function(e) {
				var oPrePedido = e.target.result;

				if (oPrePedido == undefined) {

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

					var promise = new Promise(function(resolve, reject) {
						that.onCarregaMateriais(db, oPrePedido.tipoPedido, resolve, reject);
						console.log("Carrega materiais sem preço");
					});

					promise.then(function(resolve) {
						// console.log("Carrega materiais com preço");
						// that.onCarregaMateriaisComPreco(db, oPrePedido.tabPreco, that.oVetorMateriais);
					});

					var storeItensPedido = db.transaction("ItensPedido", "readwrite").objectStore("ItensPedido");
					storeItensPedido.openCursor().onsuccess = function(event) {
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

							if (oPrePedido.idStatusPedido == 3 || oPrePedido.idStatusPedido == 2 || oPrePedido.idStatusPedido == 9) {
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

		onDataAtualizacao: function() {
			var date = new Date();
			var dia = String(date.getDate());
			var mes = String(date.getMonth() + 1);
			var ano = String(date.getFullYear());
			var minuto = String(date.getMinutes());
			var hora = String(date.getHours());
			var seg = String(date.getSeconds());

			if (dia.length == 1) {
				dia = String("0" + dia);
			}
			if (mes.length == 1) {
				mes = String("0" + mes);
			}
			if (minuto.length == 1) {
				minuto = String("0" + minuto);
			}
			if (hora.length == 1) {
				hora = String("0" + hora);
			}
			if (seg.length == 1) {
				seg = String("0" + seg);
			}
			//HRIMP E DATIMP
			var data = String(dia + "/" + mes + "/" + ano);
			var horario = String(hora) + ":" + String(minuto) + ":" + String(seg);

			return [data, horario];
		},

		onCarregaMateriais: function(db, tipoPedido, resolve, reject) {
			var that = this;


			var transaction = db.transaction("Materiais", "readonly");
			var objectStoreMaterial = transaction.objectStore("Materiais");

			var indexMtpos = objectStoreMaterial.index("mtpos");
			var request = indexMtpos.getAll();

			request.onsuccess = function(event) {
				that.oVetorMateriais = event.target.result;

				var oModel = new sap.ui.model.json.JSONModel(that.oVetorMateriais);
				that.getView().setModel(oModel, "materiaisCadastrados");

				console.log("Materiais carregados: mtpos: " + tipoPedido);
				resolve();
			};
		},

		onCarregaMateriaisComPreco: function(db, tabPreco, vetorMateriais) {
			
			var vetorResultMateriais = [];
			var tabbri = this.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabbri;
			var tabamo = this.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabamo;
			var tabbon = this.getOwnerComponent().getModel("modelAux").getProperty("/Usuario").tabbon;

			var werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
			var that = this;

			for (var i = 0; i < vetorMateriais.length; i++) {

				if (vetorMateriais[i].mtpos == "NORM") {

					var storeA960 = db.transaction("A960", "readwrite");
					var objA960 = storeA960.objectStore("A960");

					var idA960 = werks + "." + tabPreco + "." + vetorMateriais[i].matnr;
					var requesA960 = objA960.get(idA960);

					requesA960.onsuccess = function(e) {
						var oA960 = e.target.result;
						if (oA960 != undefined) {
							for (var j = 0; j < vetorMateriais.length; j++) {
								if (oA960.matnr == vetorMateriais[j].matnr) { 
									vetorResultMateriais.push(vetorMateriais[j]);
									break;
								}
							}
						}
					};

				} else if (vetorMateriais[i].mtpos == "YAMO" || vetorMateriais[i].mtpos == "YBRI" || vetorMateriais[i].mtpos == "YBON") {
					var tabPrecoAB = "";

					if (vetorMateriais[i].mtpos == "YBRI") {
						tabPrecoAB = tabbri;
					} else if (vetorMateriais[i].mtpos == "YAMO") {
						tabPrecoAB = tabamo;
					} else if (vetorMateriais[i].mtpos == "YBON") {
						tabPrecoAB = tabbri;
					}

					storeA960 = db.transaction("A960", "readwrite");
					objA960 = storeA960.objectStore("A960");

					idA960 = werks + "." + tabPrecoAB + "." + vetorMateriais[i].matnr;
					var requesA963 = objA960.get(idA960);

					requesA963.onsuccess = function(e) {
						var oA960 = e.target.result;

						if (oA960 != undefined) {
							for (var j = 0; j < vetorMateriais.length; j++) {

								if (oA960.matnr == vetorMateriais[j].matnr) {
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

		onChangeTipoPedido: function(evt) {

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
			open.onerror = function() {
				MessageBox.show("Não foi possivel fazer leitura do Banco Interno.", {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;

				var promise = new Promise(function(resolve, reject) {
					that.onCarregaMateriais(db, tipoPedido, resolve);
				});

			};
		}, 
		
		onChangeTabelaPreco: function(evt) {
			var that = this;
			var oSource = evt.getSource();
			var vetorResultMateriais = [];
			
			console.log("Change Tabela Preço Event");
			
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
			// 	if (tipoPedido == "") {

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
		
		onChangeFormaPagamento: function(evt) {

			var oSource = evt.getSource();
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/FormaPagamento", oSource.getSelectedKey());
			this.getOwnerComponent().getModel("modelAux").setProperty("/ObrigaSalvar", false);
			
		},

		/// FIM EVENTOS CAMPOS

		/// EVENTOS UTILITARIOS <<<<<<<<<<<<

		bloquearCampos: function() {

			// this.byId("idEstabelecimento").setProperty("enabled", false);
			this.byId("idTipoPedido").setProperty("enabled", false);
			// this.byId("idVencimento1").setProperty("enabled", false);
			// this.byId("idVencimento2").setProperty("enabled", false);
			// this.byId("idVencimento3").setProperty("enabled", false);
			this.byId("idTabelaPreco").setProperty("enabled", false);
			this.byId("idFormaPagamento").setProperty("enabled", false);
			// this.byId("idTipoTransporte").setProperty("enabled", false);

		},

		desbloquearCampos: function() {
			// this.byId("idEstabelecimento").setProperty("enabled", true);
			this.byId("idTipoPedido").setProperty("enabled", true);
			this.byId("idTabelaPreco").setProperty("enabled", true);
			this.byId("idFormaPagamento").setProperty("enabled", true);
			// this.byId("idVencimento1").setProperty("enabled", true);
			// this.byId("idVencimento2").setProperty("enabled", true);
			// this.byId("idVencimento3").setProperty("enabled", true);
			// this.byId("idTipoTransporte").setProperty("enabled", true);

		},

		resetarCamposTela: function() {

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

		onNavBack: function() {

			sap.ui.core.UIComponent.getRouterFor(this).navTo("pedido");
			this.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
			this.getOwnerComponent().getModel("modelAux").setProperty("/Kunnr", "");
			//Essa propriedade serve para identificação se o kra te, o numero CNPJ, se tiver em branco o kra é pessia física.
			this.getOwnerComponent().getModel("modelAux").setProperty("/idFiscalCliente", "");
			this.onResetaCamposPrePedido();

		},

		/// FIM EVENTOS UTILITARIOS

		// EVENTOS DO FRAGMENTO 					<<<<<<<<<<<<

		onItemChange: function(oEvent) {
			var that = this;
			var itemExistente = false;
			var codItem = oEvent.getSource().getValue();
			var oPanel = sap.ui.getCore().byId("idDialog");
			oPanel.setBusy(true);
			var encontrouPrecoMax = false;
			var encontrouPrecoMin = false;
			
			var werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
			var tabPreco = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco");
			var tipoPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");

			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;

				oPanel.setBusy(true);

				if (codItem !== "") {

					var store = db.transaction("Materiais", "readwrite");
					var objMaterial = store.objectStore("Materiais");

					var requestMaterial = objMaterial.get(codItem);

					requestMaterial.onsuccess = function(e) {
						var oMaterial = e.target.result;

						if (oMaterial == undefined) {
							oPanel.setBusy(false);

							MessageBox.show("Não existe o produto: " + codItem, {
								icon: MessageBox.Icon.ERROR,
								title: "Produto não encontrado.",
								actions: [MessageBox.Action.YES],
								onClose: function() {
									that.onResetaCamposDialog();
									sap.ui.getCore().byId("idItemPedido").focus();
								}
							});

						} else {

							that.oItemPedido.zzQnt = 1;
							that.oItemPedido.matnr = oMaterial.matnr;
							that.oItemPedido.maktx = oMaterial.maktx;
							that.oItemPedido.ntgew = parseFloat(oMaterial.ntgew);
							that.oItemPedido.aumng = parseInt(oMaterial.aumng, 10);
							that.oItemPedido.extwg = oMaterial.extwg;
							that.oItemPedido.mtpos = oMaterial.mtpos;
							
							//Lógica para encontrar o preço de venda do produto. Respeitar o vetor de seq das tabelas.
							for(var i = 0; i < that.oVetorSeqPrecoMax.length; i ++){
								
								if(that.oVetorSeqPrecoMax[i].kotabnr === "950"){
									
									for(var j = 0; j < that.oVetorA950.length; j ++){
										 if(that.oVetorA950[j].werks === werks && that.oVetorA950[j].kschl === "ZPR0" && that.oVetorA950[j].pltyp === tabPreco && that.oVetorA950[j].matnr === codItem){
											that.oItemPedido.zVProd = that.oVetorA950[j].kbetr;
											encontrouPrecoMax = true;
											break;
										}
									}
									
								} else if(that.oVetorSeqPrecoMax[i].kotabnr === "406"){
									for(j=0; j<that.oVetorA406.length; j++){
										if(that.oVetorA406[j].werks === werks && that.oVetorA406[j].matnr === codItem){
											that.oItemPedido.zVProd = that.oVetorA406[j].kbetr;
											encontrouPrecoMax = true;
											break;
										}
									}
									
								} else if(that.oVetorSeqPrecoMax[i].kotabnr == "900"){
									for(j = 0; j < that.oVetorA900.length; j ++){
										if(that.oVetorA900[j].werks === werks && that.oVetorA900[j].kschl === "ZPR0" && that.oVetorA900[j].matnr === codItem){
											that.oItemPedido.zVProd = that.oVetorA900[j].kbetr;
											encontrouPrecoMax = true;
											break;
										}
									}
								}
							}
							
							if(encontrouPrecoMax === false){
								
								MessageBox.show("Não existe preço de venda cadastrado para o produto: " + that.oItemPedido.matnr, {
									icon: MessageBox.Icon.ERROR,
									title: "Produto sem preço de venda!",
									actions: ["OK"],
									onClose: function() {
										that.onResetaCamposDialog();
										oPanel.setBusy(false);
										sap.ui.getCore().byId("idItemPedido").setValue("");
										return;
									}
								});
							} else {
								
								//Lógica para encontrar o preço de Min permitido do produto. Respeitar o vetor de seq das tabelas.
								for(i = 0; i < that.oVetorSeqPrecoMin.length; i ++){
									
									if(that.oVetorSeqPrecoMin[i].kotabnr === "950"){
										
										for(var j = 0; j < that.oVetorA950.length; j ++){
											 if(that.oVetorA950[j].werks === werks && that.oVetorA950[j].kschl === "ZPR0" && that.oVetorA950[j].pltyp === tabPreco && that.oVetorA950[j].matnr === codItem){
												that.oItemPedido.zVProd = that.oVetorA950[j].kbetr;
												encontrouPrecoMin = true;
												break;
											}
										}
										
									} else if(that.oVetorSeqPrecoMin[i].kotabnr === "406"){
										for(j=0; j<that.oVetorA406.length; j++){
											if(that.oVetorA406[j].werks === werks && that.oVetorA406[j].matnr === codItem){
												that.oItemPedido.zVProd = that.oVetorA406[j].kbetr;
												encontrouPrecoMax = true;
												break;
											}
										}
										
									}else if(that.oVetorSeqPrecoMin[i].kotabnr == "900"){
										for(j = 0; j < that.oVetorA900.length; j ++){
											if(that.oVetorA900[j].werks === werks && that.oVetorA900[j].kschl === "ZPR0" && that.oVetorA900[j].matnr === codItem){
												that.oItemPedido.zVProd = that.oVetorA900[j].kbetr;
												encontrouPrecoMax = true;
												break;
											}
										}
									}
								}
								
								if(encontrouPrecoMin === false){
									
									MessageBox.show("Não existe preço mínimo cadastrado para o produto: " + that.oItemPedido.matnr , {
										icon: MessageBox.Icon.ERROR,
										title: "Produto sem preço de venda!",
										actions: ["OK"],
										onClose: function() {
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

		onCriarIndexItemPedido: function() {
			var that = this;

			//Define o index do produto a ser inserido
			for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
				if (i === 0) {
					var aux = that.objItensPedidoTemplate[i].idItemPedido.split("/");
					that.indexItem = parseInt(aux[1]);

				} else if (i > 0) {
					aux = that.objItensPedidoTemplate[i].idItemPedido.split("/");

					if (that.indexItem < parseInt(aux[1])) {
						that.indexItem = parseInt(aux[1]);

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

		onResetaCamposDialog: function() {
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

		},

		onQuantidadeChange: function(evt) {
			var that = this;
			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;

				var store = db.transaction("Materiais", "readwrite");
				var objMaterial = store.objectStore("Materiais");

				var requestMaterial = objMaterial.get(sap.ui.getCore().byId("idItemPedido").getValue());

				requestMaterial.onsuccess = function(e) {
					var oMaterial = e.target.result;

					if (oMaterial == undefined) {

						sap.ui.getCore().byId("idItemPedido").setValue("");

						MessageBox.show("Não existe o produto: " + sap.ui.getCore().byId("idItemPedido").getValue(), {
							icon: MessageBox.Icon.ERROR,
							title: "Produto não encontrado.",
							actions: [MessageBox.Action.YES],
							onClose: function() {
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
								onClose: function() {
									sap.ui.getCore().byId("idQuantidade").setValue(1);
									sap.ui.getCore().byId("idQuantidade").focus();

								}
							});
						}
					}
				};
			};
		},

		onFocusQnt: function() {
			sap.ui.getCore().byId("idDesconto").focus();
		},

		onDescontoChange: function() {
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
					onClose: function() {

					}
				});
			}
		},

		calculaPrecoItem: function() {
			var that = this;

			//Preço cheio sem descontos
			that.oItemPedido.zzVprodDesc = that.oItemPedido.zzVprod;
			that.oItemPedido.zzVprodDesc = that.oItemPedido.zzVprodDesc - (that.oItemPedido.zzVprodDesc * that.oItemPedido.kbetr / 100);
			
			that.oItemPedido.zzVprodDescTotal = that.oItemPedido.zzVprodDesc * that.oItemPedido.zzQnt;
			that.oItemPedido.zzVprodDescTotal = Math.round(parseFloat(that.oItemPedido.zzVprodDescTotal * 100)) / 100;

		},

		calculaTotalPedido: function() {
			var Qnt = 0;
			var that = this;
			var Total = 0;
			var Ntgew = 0;
			var QntProdutos = 0;
			var valorParcelas = 0;
			var difProdDiluicao = 0;
			var TotalPedidoDesc = 0;
			var valorCampBrinde = 0;
			var valorCampGlobal = 0;
			var valorCampEnxoval = 0;
			var totalVerbaGerada = 0;
			var percAcresPrazoMed = 0;
			var totalComissaoGerada = 0;
			var totalVerbaUtilizada = 0;
			var totalComissaoUtilizada = 0;
			var totalExcedenteDescontos = 0;
			var valorTotalAcresPrazoMed = 0;
			var valorTotalAcresBonif = 0;
			var valorTotalAcresAmostra = 0;
			var valorTotalAcresBrinde = 0;
			var valorNaoDirecionadoDesconto = 0;
			var valorNaoDirecionadoPrazoMed = 0;
			var valorNaoDirecionadoAmostra = 0;
			var valorNaoDirecionadoBrinde = 0;
			var valorNaoDirecionadoBonificacao = 0;
			var existeParcelas = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ExisteEntradaPedido");
			var valorEntradaPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValorEntradaPedido");
			var percEntradaPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/PercEntradaPedido");
			
			var quantidadeParcelas = parseInt(this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/QuantParcelas"), 10);
			quantidadeParcelas = (quantidadeParcelas == 0 ? 1 : quantidadeParcelas);
			
			var tipoPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");
			var totalExcedenteDescontosDiluicao = 0;

			/* Campanha Enxoval */
			// if (this.pedidoDetalheEnxoval){
			// 	this.pedidoDetalheEnxoval.calculaTotalPedidoEnxoval();
			// }

			//Valores utilizados para abater de verbas e comissões.
			var verbaUtilizadaDesconto = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValVerbaUtilizadaDesconto");
			if (verbaUtilizadaDesconto === "") {
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaUtilizadaDesconto", 0);
			} else {
				verbaUtilizadaDesconto = parseFloat(verbaUtilizadaDesconto);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaUtilizadaDesconto", verbaUtilizadaDesconto);
			}

			var comissaoUtilizadaDesconto = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValComissaoUtilizadaDesconto");
			if (comissaoUtilizadaDesconto === "") {
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoUtilizadaDesconto", 0);
			} else {
				comissaoUtilizadaDesconto = parseFloat(comissaoUtilizadaDesconto);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoUtilizadaDesconto", comissaoUtilizadaDesconto);
			}

			var comissaoUtilizadaPrazoMed = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoPrazoMed");
			if (comissaoUtilizadaPrazoMed === "") {

				comissaoUtilizadaPrazoMed = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoPrazoMed", 0);

			} else {

				comissaoUtilizadaPrazoMed = parseFloat(comissaoUtilizadaPrazoMed);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoPrazoMed", comissaoUtilizadaPrazoMed);
			}

			var valUtilizadoVerbaPrazoMed = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaPrazoMed");
			if (valUtilizadoVerbaPrazoMed === "") {

				valUtilizadoVerbaPrazoMed = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaPrazoMed", 0);
			} else {

				valUtilizadoVerbaPrazoMed = parseFloat(valUtilizadoVerbaPrazoMed);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaPrazoMed", valUtilizadoVerbaPrazoMed);
			}

			var valUtilizadoVerbaBrinde = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaBrinde");
			if (comissaoUtilizadaDesconto === "") {

				valUtilizadoVerbaBrinde = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else {

				valUtilizadoVerbaBrinde = parseFloat(valUtilizadoVerbaBrinde);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", valUtilizadoVerbaBrinde);
			}

			var valUtilizadoComissaoBrinde = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoBrinde");
			if (valUtilizadoComissaoBrinde === "") {

				valUtilizadoComissaoBrinde = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBrinde", 0);

			} else {

				valUtilizadoComissaoBrinde = parseFloat(valUtilizadoComissaoBrinde);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBrinde", valUtilizadoComissaoBrinde);
			}
			
			/*Alteração: 20190308: Inclusão dos valores de campanha enxoval */
			/* Valores inclusos para o cálculo do excedente da destinação */
			var valUtilizadoCampanhaEnxoval = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampEnxoval");
			if (valUtilizadoCampanhaEnxoval === "") {

				valUtilizadoCampanhaEnxoval = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampEnxoval", 0);

			} else {

				valUtilizadoCampanhaEnxoval = parseFloat(valUtilizadoCampanhaEnxoval);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampEnxoval", valUtilizadoCampanhaEnxoval);
			}
			/* --FIM-- */

			var valTotalExcedenteBrinde = 0;
			
			/* Campanha brinde inicio - Diego Djeri - 20190312*/
			var valTotalCampanhaBrinde = 0 ;
			/* Campanha brinde fim - Diego Djeri - 20190312*/
			
			/* Campanha Global inicio - Ricardo Junior - 20190315*/
			var valTotalCampanhaGlobal = 0;
			/* Campanha brinde fim - Ricardo Junior - 20190315*/
			
			// parseFloat(that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteBrinde"));
			// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBrinde", valTotalExcedenteBrinde.toFixed(2));

			var valUtilizadoVerbaAmostra = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaAmostra");
			if (valUtilizadoVerbaAmostra === "") {

				valUtilizadoVerbaAmostra = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaAmostra", 0);
			} else {

				valUtilizadoVerbaAmostra = parseFloat(valUtilizadoVerbaAmostra);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaAmostra", valUtilizadoVerbaAmostra);

			}

			var valUtilizadoComissaoAmostra = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoAmostra");
			if (valUtilizadoComissaoAmostra === "") {

				valUtilizadoComissaoAmostra = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoAmostra", 0);

			} else {

				valUtilizadoComissaoAmostra = parseFloat(valUtilizadoComissaoAmostra);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoAmostra", valUtilizadoComissaoAmostra);

			}

			var valTotalExcedenteAmostra = 0;
			// valTotalExcedenteAmostra = parseFloat(that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteAmostra"));
			// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteAmostra", valTotalExcedenteAmostra.toFixed(2));

			var valUtilizadoVerbaBonif = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaBonif");
			if (valUtilizadoVerbaBonif === "") {

				valUtilizadoVerbaBonif = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBonif", 0);
			} else {

				valUtilizadoVerbaBonif = parseFloat(valUtilizadoVerbaBonif);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBonif", valUtilizadoVerbaBonif);
			}

			var valUtilizadoComissaoBonif = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoBonif");
			if (valUtilizadoComissaoBonif === "") {

				valUtilizadoComissaoBonif = 0;
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBonif", 0);
			} else {

				valUtilizadoComissaoBonif = parseFloat(valUtilizadoComissaoBonif);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBonif", valUtilizadoComissaoBonif);
			}

			var dValUtilizadoCampEnxoval = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampEnxoval");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampEnxoval", (dValUtilizadoCampEnxoval ? dValUtilizadoCampEnxoval : 0));
			
			var dValUtilizadoCampGlobal = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampGlobal");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampGlobal", (dValUtilizadoCampGlobal ? dValUtilizadoCampGlobal : 0));

			var valTotalExcedenteBonif = 0;
			// valTotalExcedenteBonif = parseFloat(that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteBonif"));
			// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBonif", valTotalExcedenteBonif.toFixed(2));

			for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
				//VALORES EM COMUM PARA TODOS OS TIPOS DE ITEM
				if (that.objItensPedidoTemplate[i].mtpos != "YAMO" && that.objItensPedidoTemplate[i].mtpos != "YBRI") {
					TotalPedidoDesc += that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt;
				}

				Total += that.objItensPedidoTemplate[i].zzVprod * that.objItensPedidoTemplate[i].zzQnt;
				Qnt += that.objItensPedidoTemplate[i].zzQnt;
				QntProdutos += 1;

				if (that.objItensPedidoTemplate[i].ntgew > 0) {
					Ntgew += that.objItensPedidoTemplate[i].ntgew * that.objItensPedidoTemplate[i].zzQnt;
				}

				// >>>>>>>>>>>> PADRÃO PARA AMBOS OS TIPOS DE ITEM (NORMAL / DILUÍDO) >>>>>>>>>>>>
				if (that.objItensPedidoTemplate[i].mtpos == "YBRI") {
					
					if(that.objItensPedidoTemplate[i].zzUtilCampGlobal == "Sim"){
						
						//SOMA OS ITENS PARA QUANTIFICAR O QUANTO GEROU DE EXCEDENTE DE BRINDE. TIRANDO OS ITENS DE CAMPANHA GLOBAL. zzUtilCampGlobal == "Não"
						valTotalCampanhaGlobal += that.objItensPedidoTemplate[i].zzVprodDesc2 * that.objItensPedidoTemplate[i].zzQnt;
						
					} else {
						// Alteração para campanha de Global - 20190315 - Ricardo Junior
						/* Alteração para campanha de brindes - 20190312 - Diego Djeri */
						/* Inicio */
						var zzQtdeExcedente = 0;
						var zzQtdeCpBrinde = that.objItensPedidoTemplate[i].zzQntCpBrinde;
						
						zzQtdeExcedente = that.objItensPedidoTemplate[i].zzQnt;
						
						/* Verifico se existe quantidade de campanha pra brindes */
						if (zzQtdeCpBrinde) {
							zzQtdeExcedente = zzQtdeExcedente - zzQtdeCpBrinde;
						} else{
							zzQtdeCpBrinde = 0;
						}
	
						valTotalExcedenteBrinde += that.objItensPedidoTemplate[i].zzVprodDesc2 * zzQtdeExcedente;
						valTotalCampanhaBrinde += that.objItensPedidoTemplate[i].zzVprodDesc2 * zzQtdeCpBrinde;
						//valTotalExcedenteBrinde += that.objItensPedidoTemplate[i].zzVprodDesc2 * that.objItensPedidoTemplate[i].zzQnt;
						/* Fim - 20190312 - Diego Djeri */
						/* Fim - 20190315 - Ricardo Junior */
					}
					
				} else if (that.objItensPedidoTemplate[i].mtpos == "YAMO" && that.objItensPedidoTemplate[i].zzQntAmostra > 0) {

					valTotalExcedenteAmostra += that.objItensPedidoTemplate[i].zzVprodDesc2 * that.objItensPedidoTemplate[i].zzQntAmostra;

				} else if (that.objItensPedidoTemplate[i].mtpos == "NORM") {
					
					if (tipoPedido == "YBON" || tipoPedido == "YTRO") {
						
						//SOMA OS ITENS PARA QUANTIFICAR O QUANTO GEROU DE EXCEDENTE DE BRINDE. TIRANDO OS ITENS DE CAMPANHA GLOBAL. zzUtilCampGlobal == "Não"
						valTotalExcedenteBonif += that.objItensPedidoTemplate[i].zzVprodDesc2 * that.objItensPedidoTemplate[i].zzQnt;
					
					} else {
						if (that.objItensPedidoTemplate[i].tipoItem == "Normal") {

							if (that.objItensPedidoTemplate[i].tipoItem2 == "Normal") {
								//VALOR DE COMISSÃO GERADA NO PEDIDO
								totalComissaoGerada += that.objItensPedidoTemplate[i].zzVprodDesc2 * (that.objItensPedidoTemplate[i].zzPercom / 100) *
									(that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao);

								//VALOR DE VERBA GERADA NO PEDIDO
								totalVerbaGerada += that.objItensPedidoTemplate[i].zzVprodDesc2 * (that.objItensPedidoTemplate[i].zzPervm / 100) *
									(that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao);

								//Calculo do acréscimo de prazo médio .
								percAcresPrazoMed = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/PercExcedentePrazoMed");
								valorTotalAcresPrazoMed += parseFloat(that.objItensPedidoTemplate[i].zzVprodDesc2 * (percAcresPrazoMed / 100) *
									(that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao));

								//calculo do desconto total retirando excluindo total diluido pra ele
								var valorExcedido = Math.round((that.objItensPedidoTemplate[i].zzVprodDesc2 - that.objItensPedidoTemplate[i].zzVprodMinPermitido) * 100) / 100;
								that.objItensPedidoTemplate[i].zzValExcedidoItem = valorExcedido;

								if (that.objItensPedidoTemplate[i].zzValExcedidoItem < 0) {
									//Negatvo .. excedeu o valor.
									console.log("Produto: " + that.objItensPedidoTemplate[i].matnr + " excedeu: " + that.objItensPedidoTemplate[i].zzValExcedidoItem);
									totalExcedenteDescontos += that.objItensPedidoTemplate[i].zzValExcedidoItem * that.objItensPedidoTemplate[i].zzQnt;
								}

							} else if (that.objItensPedidoTemplate[i].tipoItem2 == "Diluicao") {
								//VALOR DE COMISSÃO GERADA NO PEDIDO
								totalComissaoGerada += that.objItensPedidoTemplate[i].zzVprodDesc * (that.objItensPedidoTemplate[i].zzPercom / 100) *
									(that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao);

								//VALOR DE VERBA GERADA NO PEDIDO
								totalVerbaGerada += that.objItensPedidoTemplate[i].zzVprodDesc * (that.objItensPedidoTemplate[i].zzPervm / 100) *
									(that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao);

							}

						} else if (that.objItensPedidoTemplate[i].tipoItem == "Diluido") {

							// totalExcedenteDescontosDiluicao += that.objItensPedidoTemplate[i].zzValorDiluido;
							//Soma o valor excedido de diluição no desconto de bonificação
							valTotalExcedenteBonif += that.objItensPedidoTemplate[i].zzValorDiluido;

							if (that.objItensPedidoTemplate[i].tipoItem2 == "Normal") {

								//VALOR DE COMISSÃO GERADA NO PEDIDO
								totalComissaoGerada += that.objItensPedidoTemplate[i].zzVprodDesc2 * (that.objItensPedidoTemplate[i].zzPercom / 100) *
									(that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao);

								//VALOR DE VERBA GERADA NO PEDIDO
								totalVerbaGerada += that.objItensPedidoTemplate[i].zzVprodDesc2 * (that.objItensPedidoTemplate[i].zzPervm / 100) *
									(that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao);

								//Calculo do acréscimo de prazo médio .
								percAcresPrazoMed = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/PercExcedentePrazoMed");
								valorTotalAcresPrazoMed += parseFloat(that.objItensPedidoTemplate[i].zzVprodDesc2 * (percAcresPrazoMed / 100) *
									(that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao));

								//calculo do desconto total retirando excluindo total diluido pra ele
								valorExcedido = Math.round((that.objItensPedidoTemplate[i].zzVprodDesc2 - that.objItensPedidoTemplate[i].zzVprodMinPermitido) * 100) / 100;
								that.objItensPedidoTemplate[i].zzValExcedidoItem = valorExcedido;

								if (that.objItensPedidoTemplate[i].zzValExcedidoItem < 0) {
									//Negatvo .. excedeu o valor.
									console.log("Produto: " + that.objItensPedidoTemplate[i].matnr + " excedeu: " + that.objItensPedidoTemplate[i].zzValExcedidoItem);
									totalExcedenteDescontos += that.objItensPedidoTemplate[i].zzValExcedidoItem * (that.objItensPedidoTemplate[i].zzQnt - that.objItensPedidoTemplate[i].zzQntDiluicao);
								}

							}
						}
					}

				}
			}

			console.log("CALCULO DADOS GERAIS");

			totalVerbaGerada = Math.round(totalVerbaGerada * 100) / 100;
			totalComissaoGerada = Math.round(totalComissaoGerada * 100) / 100;

			//Calculando total de desconto dado.
			TotalPedidoDesc = Math.round(parseFloat(TotalPedidoDesc * 100)) / 100;

			var descontoTotal = Total - TotalPedidoDesc;
			descontoTotal = Math.round(parseFloat(descontoTotal * 100)) / 100;

			// console.log(totalExcedenteDescontosDiluicao);
			// totalExcedenteDescontosDiluicao = Math.round(totalExcedenteDescontosDiluicao * 100) / 100;

			console.log(totalExcedenteDescontos);
			totalExcedenteDescontos = Math.abs(Math.round(totalExcedenteDescontos * 100) / 100);

			// TODO: Precisa ser feito a comparação da verba que o kra tem pra ver se ele ele excedeu o tanto de verba que ele tem.
			// TODO: A comissão precisa ser travada apenas se o total do valor gerado de comissão no proprio pedido for menor que o valor destiando para descontar.

			console.log("Verba: " + verbaUtilizadaDesconto + ". Comissão: " + comissaoUtilizadaDesconto + ". Comissão PM: " + comissaoUtilizadaPrazoMed);

			//VALOR NAO DIRECIONADO NO BALANÇO DE VERBAS. UMA VEZ QUE GEROU UMA DIFERENÇA.. GERARÁ WORKFLOW DE APROVAÇÃO;
			console.log("VALOR NÃO DIRECIONADO DESCONTOS.");
			valorNaoDirecionadoDesconto = Math.round((totalExcedenteDescontos - (verbaUtilizadaDesconto + comissaoUtilizadaDesconto)) * 100) / 100;

			console.log("VALOR NÃO DIRECIONADO PRAZO MÉDIO.");
			valorNaoDirecionadoPrazoMed = Math.round((valorTotalAcresPrazoMed - (valUtilizadoVerbaPrazoMed + comissaoUtilizadaPrazoMed)) * 100) / 100;

			console.log("VALOR NÃO DIRECIONADO AMOSTRA.");
			valorNaoDirecionadoAmostra = Math.round((valTotalExcedenteAmostra - (valUtilizadoVerbaAmostra + valUtilizadoComissaoAmostra)) * 100) / 100;
			that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteAmostra", valTotalExcedenteAmostra.toFixed(2));

			console.log("VALOR NÃO DIRECIONADO BONIFICAÇÃO.");
			valorNaoDirecionadoBonificacao = Math.round((valTotalExcedenteBonif - (valUtilizadoVerbaBonif + valUtilizadoComissaoBonif)) * 100) / 100;
			that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBonif", valTotalExcedenteBonif.toFixed(2));

			console.log("VALOR NÃO DIRECIONADO BRINDE.");
			valorNaoDirecionadoBrinde = Math.round((valTotalExcedenteBrinde - (valUtilizadoVerbaBrinde + valUtilizadoComissaoBrinde)) * 100) / 100;
			that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBrinde", valTotalExcedenteBrinde.toFixed(2));

			//NÃO DIRECIONADO
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoDesconto", parseFloat(valorNaoDirecionadoDesconto).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoPrazoMed", parseFloat(valorNaoDirecionadoPrazoMed).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoBrinde", parseFloat(valorNaoDirecionadoBrinde).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoAmostra", parseFloat(valorNaoDirecionadoAmostra).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteNaoDirecionadoBonif", parseFloat(valorNaoDirecionadoBonificacao).toFixed(2));

			console.log("TOTAL VERBA UTILIZADA.");
			//Será a propria verba destinada para descontos : verbaUtilizadaDesconto
			totalVerbaUtilizada = verbaUtilizadaDesconto + valUtilizadoVerbaPrazoMed + valUtilizadoVerbaAmostra + valUtilizadoVerbaBonif + valUtilizadoVerbaBrinde;

			console.log("TOTAL COMISSÃO UTILIZADA.");
			totalComissaoUtilizada = comissaoUtilizadaDesconto + comissaoUtilizadaPrazoMed + valUtilizadoComissaoAmostra + valUtilizadoComissaoBonif + valUtilizadoComissaoBrinde;

			//TOTAIS DO PEDIDO
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaPedido", parseFloat(totalVerbaGerada).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoPedido", parseFloat(totalComissaoGerada).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TotalItensPedido", Qnt);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotPed", parseFloat(TotalPedidoDesc).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Ntgew", Ntgew);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValDescontoTotal", descontoTotal);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampEnxoval", valorCampEnxoval);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampGlobal", valorCampGlobal);

			console.log("VALORES EXCEDENTES");

			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalAbatidoComissao", parseFloat(totalComissaoUtilizada).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalAbatidoVerba", parseFloat(totalVerbaUtilizada).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteBonif", parseFloat(valTotalExcedenteBonif).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedentePrazoMed", parseFloat(valorTotalAcresPrazoMed).toFixed(2));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteDesconto", parseFloat(totalExcedenteDescontos).toFixed(2));

			console.log("VALORES UTILIZADOS CAMPANHA");
			var teste = "0.00";
			
			/* Campanha brinde inicio - Diego Djeri - 20190312*/
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalCampBrinde", parseFloat(valTotalCampanhaBrinde));
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampBrinde", parseFloat(valTotalCampanhaBrinde));
			//this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampBrinde", valorCampBrinde);
			//this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampBrinde", teste);
			/* Campanha brinde fim - Diego Djeri - 20190312*/
			
			/* Campanha brinde inicio - Ricardo Junior - 20190315*/
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampGlobal", valTotalCampanhaGlobal);
			/* Campanha brinde fim - Ricardo Junior - 20190315*/
			
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampEnxoval", teste);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoCampProdutoAcabado", teste);
			
			
			console.log("CALCULO PARCELAMENTO");
			if (existeParcelas == false) {
				
				valorParcelas = TotalPedidoDesc / quantidadeParcelas;
				valorParcelas = parseFloat(Math.round(valorParcelas * 100) / 100).toFixed(2);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValParcelasPedido", valorParcelas);
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/QuantidadeParcelasPedido", quantidadeParcelas + " x");
				
				// Se não houve entrada, zero a informação
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/EntradaPedido", "");

			} else if (existeParcelas == true) {

				if (valorEntradaPedido == 0) {

					var aux = TotalPedidoDesc - (percEntradaPedido * TotalPedidoDesc) / 100;
					valorParcelas = aux / quantidadeParcelas;
					valorParcelas = Math.round(valorParcelas * 100) / 100;
					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValParcelasPedido", "Entrada: " + percEntradaPedido + "% + " +
					// 	quantidadeParcelas + "x " + valorParcelas.toLocaleString("pt-BR"));

					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/EntradaPedido", "Entrada: " + percEntradaPedido + " % + ");
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/QuantidadeParcelasPedido", quantidadeParcelas + " x ");
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValParcelasPedido", valorParcelas);

				} else if (percEntradaPedido == 0) {

					aux = (TotalPedidoDesc - valorEntradaPedido);
					valorParcelas = aux / quantidadeParcelas;
					valorParcelas = Math.round(valorParcelas * 100) / 100;

					// that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValParcelasPedido", "Entrada: R$: " + valorEntradaPedido +
					// 	" + " + quantidadeParcelas + "x " + valorParcelas);

					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/EntradaPedido", "Entrada: R$: " + valorEntradaPedido + " + ");
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/QuantidadeParcelasPedido", quantidadeParcelas + " x ");
					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValParcelasPedido", valorParcelas);

				}
			}

			totalExcedenteDescontos = Math.round(totalExcedenteDescontos * 100) / 100;
			verbaUtilizadaDesconto = Math.round(verbaUtilizadaDesconto * 100) / 100;
			comissaoUtilizadaDesconto = Math.round(comissaoUtilizadaDesconto * 100) / 100;

			console.log("VALIDAÇÕES DE VALORES DIGITADOS MAIS QUE DEVERIAM.");
			//DESCONTO
			if ((comissaoUtilizadaDesconto + verbaUtilizadaDesconto).toFixed(2) > totalExcedenteDescontos) {

				that.byId("idTopLevelIconTabBar").setSelectedKey("tab5");
				that.byId("idComissaoUtilizadaDesconto").setValueState("Error");
				that.byId("idComissaoUtilizadaDesconto").setValueStateText("Valor destinado para abater o excedente de descontos ultrapassou o valor total necessário. Desconto Excedente (" +
					totalExcedenteDescontos + ")");
				that.byId("idVerbaUtilizadaDesconto").setValueState("Error");
				that.byId("idVerbaUtilizadaDesconto").setValueStateText("Valor destinado para abater o excedente de descontos ultrapassou o valor total necessário. Desconto Excedente (" +
					totalExcedenteDescontos + ")");
				that.byId("idVerbaUtilizadaDesconto").focus();

			} else {

				that.byId("idVerbaUtilizadaDesconto").setValueState("None");
				that.byId("idVerbaUtilizadaDesconto").setValueStateText("");

				that.byId("idComissaoUtilizadaDesconto").setValueState("None");
				that.byId("idComissaoUtilizadaDesconto").setValueStateText("");
			}

			valorTotalAcresPrazoMed = Math.round(valorTotalAcresPrazoMed * 100) / 100;
			valUtilizadoVerbaPrazoMed = Math.round(valUtilizadoVerbaPrazoMed * 100) / 100;
			comissaoUtilizadaPrazoMed = Math.round(comissaoUtilizadaPrazoMed * 100) / 100;

			//PRAZO MÉDIO
			if ((comissaoUtilizadaPrazoMed + valUtilizadoVerbaPrazoMed).toFixed(2) > valorTotalAcresPrazoMed) {

				that.byId("idTopLevelIconTabBar").setSelectedKey("tab5");

				that.byId("idComissaoUtilizadaPrazo").setValueState("Error");
				that.byId("idComissaoUtilizadaPrazo").setValueStateText("Valor destinado para abater da comissão ultrapassou o valor total necessário. Excedente Prazo Médio (" + valorTotalAcresPrazoMed + ")");
				that.byId("idComissaoUtilizadaPrazo").focus();

				that.byId("idVerbaUtilizadaPrazo").setValueState("Error");
				that.byId("idVerbaUtilizadaPrazo").setValueStateText("Valor destinado para abater da comissão ultrapassou o valor total necessário. Excedente Prazo Médio (" + valorTotalAcresPrazoMed + ")");

			} else {

				that.byId("idComissaoUtilizadaPrazo").setValueState("None");
				that.byId("idComissaoUtilizadaPrazo").setValueStateText("");

				that.byId("idVerbaUtilizadaPrazo").setValueState("None");
				that.byId("idVerbaUtilizadaPrazo").setValueStateText("");
			}

			valUtilizadoComissaoBonif = Math.round(valUtilizadoComissaoBonif * 100) / 100;
			valUtilizadoVerbaBonif = Math.round(valUtilizadoVerbaBonif * 100) / 100;
			valTotalExcedenteBonif = Math.round(valTotalExcedenteBonif * 100) / 100;
			valUtilizadoCampanhaEnxoval = Math.round(valUtilizadoCampanhaEnxoval * 100) / 100;
			
			/* Alterçaão: 20190308 - Diego Djeri */
			/* Inicio
				Inclusão do valor da campanha enxoval no cálculo que controla a destinação da verba em excesso.
				valUtilizadoCampanhaEnxoval
			*/

			//BONIFICAÇÃO
			if (valTotalExcedenteBonif < (valUtilizadoVerbaBonif + valUtilizadoComissaoBonif + valUtilizadoCampanhaEnxoval).toFixed(2)) {
				that.byId("idTopLevelIconTabBar").setSelectedKey("tab5");

				that.byId("idVerbaUtilizadaBonif").setValueState("Error");
				that.byId("idVerbaUtilizadaBonif").setValueStateText("Valor destinado para abater da comissão/verba ultrapassou o valor total necessário. Excedente Bonificação (" + valTotalExcedenteBonif + ")");
				that.byId("idVerbaUtilizadaBonif").focus();

				that.byId("idComissaoUtilizadaBonif").setValueState("Error");
				that.byId("idComissaoUtilizadaBonif").setValueStateText("Valor destinado para abater da comissão/verba ultrapassou o valor total necessário. Excedente Bonificação (" + valTotalExcedenteBonif + ")");

			} else {
				that.byId("idVerbaUtilizadaBonif").setValueState("None");
				that.byId("idVerbaUtilizadaBonif").setValueStateText("");

				that.byId("idComissaoUtilizadaBonif").setValueState("None");
				that.byId("idComissaoUtilizadaBonif").setValueStateText("");
			}

			valTotalExcedenteAmostra = Math.round(valTotalExcedenteAmostra * 100) / 100;
			valUtilizadoVerbaAmostra = Math.round(valUtilizadoVerbaAmostra * 100) / 100;
			valUtilizadoComissaoAmostra = Math.round(valUtilizadoComissaoAmostra * 100) / 100;

			//AMOSTRA
			if (valTotalExcedenteAmostra < (valUtilizadoVerbaAmostra + valUtilizadoComissaoAmostra).toFixed(2)) {
				that.byId("idTopLevelIconTabBar").setSelectedKey("tab5");

				that.byId("idVerbaUtilizadaAmostra").setValueState("Error");
				that.byId("idVerbaUtilizadaAmostra").setValueStateText("Valor destinado para abater da comissão/verba ultrapassou o valor total necessário. Excedente Amostra (" + valTotalExcedenteAmostra + ")");
				that.byId("idVerbaUtilizadaAmostra").focus();

				that.byId("idComissaoUtilizadaAmostra").setValueState("Error");
				that.byId("idComissaoUtilizadaAmostra").setValueStateText("Valor destinado para abater da comissão/verba ultrapassou o valor total necessário. Excedente Amostra (" + valTotalExcedenteAmostra + ")");

			} else {
				that.byId("idVerbaUtilizadaAmostra").setValueState("None");
				that.byId("idVerbaUtilizadaAmostra").setValueStateText("");

				that.byId("idComissaoUtilizadaAmostra").setValueState("None");
				that.byId("idComissaoUtilizadaAmostra").setValueStateText("");
			}

			valTotalExcedenteBrinde = Math.round(valTotalExcedenteBrinde * 100) / 100;
			valUtilizadoComissaoBrinde = Math.round(valUtilizadoComissaoBrinde * 100) / 100;
			valUtilizadoVerbaBrinde = Math.round(valUtilizadoVerbaBrinde * 100) / 100;
			
			/* Campanha brinde inicio - Diego Djeri - 20190312*/
			valTotalCampanhaBrinde = Math.round(valTotalCampanhaBrinde * 100) / 100;
			/* Campanha brinde fim - Diego Djeri - 20190312*/

			//BRINDE
			if (valTotalExcedenteBrinde < (valUtilizadoComissaoBrinde + valUtilizadoVerbaBrinde).toFixed(2)) {
				that.byId("idTopLevelIconTabBar").setSelectedKey("tab5");

				that.byId("idVerbaUtilizadaBrinde").setValueState("Error");
				that.byId("idVerbaUtilizadaBrinde").setValueStateText("Valor destinado para abater da comissão/verba ultrapassou o valor total necessário. Excedente Brinde (" + valTotalExcedenteBrinde + ")");
				that.byId("idVerbaUtilizadaBrinde").focus();

				that.byId("idComissaoUtilizadaBrinde").setValueState("Error");
				that.byId("idComissaoUtilizadaBrinde").setValueStateText("Valor destinado para abater da comissão/verba ultrapassou o valor total necessário. Excedente Brinde (" + valTotalExcedenteBrinde + ")");

			} else {

				that.byId("idVerbaUtilizadaBrinde").setValueState("None");
				that.byId("idVerbaUtilizadaBrinde").setValueStateText("");

				that.byId("idComissaoUtilizadaBrinde").setValueState("None");
				that.byId("idComissaoUtilizadaBrinde").setValueStateText("");
			}

			/* Campanha Enxoval */
			if (this.pedidoDetalheEnxoval) {
				this.pedidoDetalheEnxoval.calculaTotalPedidoEnxoval();
			}
			/* Campanha Prazo Médio */
			if (this.pedidoDetalheEnxoval) {
				this.pedidoDetalhePrazoMedio.onChecarRangeCmpPrzMed();
			}
			
			
		},
		/* calculaTotalPedido */

		onCalculaDiluicaoItem: function() {
			var that = this;
			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;
				var NrPedido = that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli");

				var totalPercentualDiluicaoDado = 0;
				var TotalDiluicao = 0;
				var TotalNormal = 0;

				that.objItensPedidoTemplate.sort(function(a, b) {
					var x = a.tipoItem2.toLowerCase();
					var y = b.tipoItem2.toLowerCase();
					return x > y ? -1 : x < y ? 1 : 0;
				});

				for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
					if (that.objItensPedidoTemplate[i].tipoItem === "Diluicao") {
						TotalDiluicao += that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt;
					}
					if (that.objItensPedidoTemplate[i].tipoItem === "Normal" && that.objItensPedidoTemplate[i].mtpos === "NORM") { //AQUII
						TotalNormal += that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt;
					}
				}

				console.log("Total Normal: " + TotalNormal.toString());
				console.log("Total Diluição: " + TotalDiluicao.toString());

				totalPercentualDiluicaoDado = Math.round((TotalDiluicao / TotalNormal) * 10000);
				totalPercentualDiluicaoDado = totalPercentualDiluicaoDado / 10000;

				if (totalPercentualDiluicaoDado > 0.30) {
					MessageBox.show("Quantidade de descontos ultrapassa o máximo permitido (30%) - máximo dado (" + Math.round(totalPercentualDiluicaoDado * 100) + "%)", {
						icon: MessageBox.Icon.ERROR,
						title: "Corrigir o itens a ser diluidos!",
						actions: [MessageBox.Action.OK]
					});

				} else {
					var store = db.transaction("ItensPedido", "readwrite").objectStore("ItensPedido");
					store.openCursor().onsuccess = function(event) {
						// consulta resultado do event
						var cursor = event.target.result;

						if (cursor) {

							if (cursor.value.nrPedCli === NrPedido) {

								var store2 = db.transaction("ItensPedido", "readwrite");
								var objItemPedido = store2.objectStore("ItensPedido");

								var request = objItemPedido.delete(cursor.key);

								request.onsuccess = function() {
									console.log("Itens Pedido deletado(s)!");
								};

								request.onerror = function() {
									console.log("Itens Pedido não foi deletado(s)!");
								};
							}

							cursor.continue();

						} else {

							var TotalNormal = 0;
							var TotalDiluicao = 0;
							var PercDescDiluicao = 0;
							var vetorAuxObjetos = [];
							var vetorAux = [];
							var existeItem = false;

							var inseridoAux = false;
							var inseridoAuxDiluicao = false;

							//ACHA O PERCENTUAL DE DESCONTO
							for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
								inseridoAux = false;
								inseridoAuxDiluicao = false;

								if (that.objItensPedidoTemplate[i].tipoItem === "Normal") { //AQUII
									if (that.objItensPedidoTemplate[i].mtpos === "NORM") {
										TotalNormal += that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt;
									}

									//Regra para totalizar o total do pedido.
									if (vetorAux.length == 0) {

										if (that.objItensPedidoTemplate[i].kbetr == undefined) {
											that.objItensPedidoTemplate[i].kbetr = 0;
										}
										if (that.objItensPedidoTemplate[i].maxdescpermitidoExtra == undefined) {
											that.objItensPedidoTemplate[i].maxdescpermitidoExtra = 0;
										}
										if (that.objItensPedidoTemplate[i].maxdescpermitido == undefined) {
											that.objItensPedidoTemplate[i].maxdescpermitido = 0;
										}

										var objAuxItem = {
											idItemPedido: that.objItensPedidoTemplate[i].idItemPedido,
											aumng: that.objItensPedidoTemplate[i].aumng,
											index: that.objItensPedidoTemplate[i].index,
											knumh: that.objItensPedidoTemplate[i].knumh,
											mtpos: that.objItensPedidoTemplate[i].mtpos,
											kbetr: that.objItensPedidoTemplate[i].kbetr,
											zzRegra: that.objItensPedidoTemplate[i].zzRegra,
											zzGrpmat: that.objItensPedidoTemplate[i].zzGrpmat,
											knumhExtra: that.objItensPedidoTemplate[i].knumhExtra,
											zzRegraExtra: that.objItensPedidoTemplate[i].zzRegraExtra,
											zzGrpmatExtra: that.objItensPedidoTemplate[i].zzGrpmatExtra,
											maktx: that.objItensPedidoTemplate[i].maktx,
											matnr: that.objItensPedidoTemplate[i].matnr,
											nrPedCli: that.objItensPedidoTemplate[i].nrPedCli,
											tipoItem: "Diluido",
											ntgew: that.objItensPedidoTemplate[i].ntgew,
											zzDesext: that.objItensPedidoTemplate[i].zzDesext,
											zzDesitem: that.objItensPedidoTemplate[i].zzDesitem,
											zzPercom: that.objItensPedidoTemplate[i].zzPercom,
											zzPervm: that.objItensPedidoTemplate[i].zzPervm,
											zzQnt: 0,
											zzVprod: that.objItensPedidoTemplate[i].zzVprod,
											zzVprodDesc: that.objItensPedidoTemplate[i].zzVprodDesc,
											zzPercDescDiluicao: PercDescDiluicao,
											zzVprodMinPermitido: 0,
											zzPercDescTotal: that.objItensPedidoTemplate[i].zzPercDescTotal,
											zzVprodDescTotal: that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt,
											//Desconto normal. *****
											zzVprodDesc2: that.objItensPedidoTemplate[i].zzVprodDesc,
											//VALOR DO ITEM QUE VAI SER DILUIDO , PARA JOGAR O VALOR DIRETAMENTE NO ITEM.
											tipoItem2: that.objItensPedidoTemplate[i].tipoItem2,
											zzQntDiluicao: that.objItensPedidoTemplate[i].zzQntDiluicao,
											zzValorDiluido: 0,
											zzValExcedidoItem: that.objItensPedidoTemplate[i].zzValExcedidoItem,
											maxdescpermitido: that.objItensPedidoTemplate[i].maxdescpermitido,
											maxdescpermitidoExtra: that.objItensPedidoTemplate[i].maxdescpermitidoExtra,
											zzVprodABB: that.objItensPedidoTemplate[i].zzVprodABB,
											zzQntAmostra: that.objItensPedidoTemplate[i].zzQntAmostra
										};

										vetorAux.push(objAuxItem);
									}

									for (var t = 0; t < vetorAux.length; t++) {

										if (vetorAux[t].matnr == that.objItensPedidoTemplate[i].matnr) {
											inseridoAux = true;
										}
									}

									if (inseridoAux == false) {

										if (that.objItensPedidoTemplate[i].kbetr == undefined) {
											that.objItensPedidoTemplate[i].kbetr = 0;
										}
										if (that.objItensPedidoTemplate[i].maxdescpermitidoExtra == undefined) {
											that.objItensPedidoTemplate[i].maxdescpermitidoExtra = 0;
										}
										if (that.objItensPedidoTemplate[i].maxdescpermitido == undefined) {
											that.objItensPedidoTemplate[i].maxdescpermitido = 0;
										}

										var objAuxItem1 = {
											idItemPedido: that.objItensPedidoTemplate[i].idItemPedido,
											index: that.objItensPedidoTemplate[i].index,
											aumng: that.objItensPedidoTemplate[i].aumng,
											knumh: that.objItensPedidoTemplate[i].knumh,
											zzRegra: that.objItensPedidoTemplate[i].zzRegra,
											mtpos: that.objItensPedidoTemplate[i].mtpos,
											kbetr: that.objItensPedidoTemplate[i].kbetr,
											zzGrpmat: that.objItensPedidoTemplate[i].zzGrpmat,
											knumhExtra: that.objItensPedidoTemplate[i].knumhExtra,
											zzRegraExtra: that.objItensPedidoTemplate[i].zzRegraExtra,
											zzGrpmatExtra: that.objItensPedidoTemplate[i].zzGrpmatExtra,
											maktx: that.objItensPedidoTemplate[i].maktx,
											matnr: that.objItensPedidoTemplate[i].matnr,
											nrPedCli: that.objItensPedidoTemplate[i].nrPedCli,
											tipoItem: "Diluido",
											ntgew: that.objItensPedidoTemplate[i].ntgew,
											zzDesext: that.objItensPedidoTemplate[i].zzDesext,
											zzDesitem: that.objItensPedidoTemplate[i].zzDesitem,
											zzPercom: that.objItensPedidoTemplate[i].zzPercom,
											zzPervm: that.objItensPedidoTemplate[i].zzPervm,
											zzQnt: 0,
											zzVprod: that.objItensPedidoTemplate[i].zzVprod,
											zzVprodDesc: that.objItensPedidoTemplate[i].zzVprodDesc,
											zzPercDescDiluicao: PercDescDiluicao,
											zzVprodMinPermitido: 0,
											zzPercDescTotal: that.objItensPedidoTemplate[i].zzPercDescTotal,
											zzVprodDescTotal: that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt,
											zzVprodDesc2: that.objItensPedidoTemplate[i].zzVprodDesc,
											//VALOR DO ITEM QUE VAI SER DILUIDO , PARA JOGAR O VALOR DIRETAMENTE NO ITEM.
											tipoItem2: that.objItensPedidoTemplate[i].tipoItem2,
											zzQntDiluicao: that.objItensPedidoTemplate[i].zzQntDiluicao,
											zzValorDiluido: 0,
											zzValExcedidoItem: that.objItensPedidoTemplate[i].zzValExcedidoItem,
											maxdescpermitido: that.objItensPedidoTemplate[i].maxdescpermitido,
											maxdescpermitidoExtra: that.objItensPedidoTemplate[i].maxdescpermitidoExtra,
											zzVprodABB: that.objItensPedidoTemplate[i].zzVprodABB,
											zzQntAmostra: that.objItensPedidoTemplate[i].zzQntAmostra
										};

										vetorAux.push(objAuxItem1);
									}

								} else if (that.objItensPedidoTemplate[i].tipoItem === "Diluicao") {
									TotalDiluicao += that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt;

									for (t = 0; t < vetorAux.length; t++) {

										if (vetorAux[t].matnr == that.objItensPedidoTemplate[i].matnr) {
											inseridoAuxDiluicao = true;
										}
									}

									if (inseridoAuxDiluicao == false) {

										if (that.objItensPedidoTemplate[i].kbetr == undefined) {
											that.objItensPedidoTemplate[i].kbetr = 0;
										}
										if (that.objItensPedidoTemplate[i].maxdescpermitidoExtra == undefined) {
											that.objItensPedidoTemplate[i].maxdescpermitidoExtra = 0;
										}
										if (that.objItensPedidoTemplate[i].maxdescpermitido == undefined) {
											that.objItensPedidoTemplate[i].maxdescpermitido = 0;
										}

										var objAuxItem2 = {
											idItemPedido: that.objItensPedidoTemplate[i].idItemPedido,
											index: that.objItensPedidoTemplate[i].index,
											aumng: that.objItensPedidoTemplate[i].aumng,
											knumh: that.objItensPedidoTemplate[i].knumh,
											mtpos: that.objItensPedidoTemplate[i].mtpos,
											kbetr: that.objItensPedidoTemplate[i].kbetr,
											zzRegra: that.objItensPedidoTemplate[i].zzRegra,
											zzGrpmat: that.objItensPedidoTemplate[i].zzGrpmat,
											knumhExtra: that.objItensPedidoTemplate[i].knumhExtra,
											zzRegraExtra: that.objItensPedidoTemplate[i].zzRegraExtra,
											zzGrpmatExtra: that.objItensPedidoTemplate[i].zzGrpmatExtra,
											maktx: that.objItensPedidoTemplate[i].maktx,
											matnr: that.objItensPedidoTemplate[i].matnr,
											nrPedCli: that.objItensPedidoTemplate[i].nrPedCli,
											tipoItem: "Diluido",
											ntgew: that.objItensPedidoTemplate[i].ntgew,
											zzDesext: that.objItensPedidoTemplate[i].zzDesext,
											zzDesitem: that.objItensPedidoTemplate[i].zzDesitem,
											zzPercom: that.objItensPedidoTemplate[i].zzPercom,
											zzPervm: that.objItensPedidoTemplate[i].zzPervm,
											zzQnt: 0,
											zzVprod: that.objItensPedidoTemplate[i].zzVprod,
											zzVprodDesc: that.objItensPedidoTemplate[i].zzVprodDesc,
											zzPercDescDiluicao: PercDescDiluicao,
											zzVprodMinPermitido: 0,
											zzPercDescTotal: that.objItensPedidoTemplate[i].zzPercDescTotal,
											zzVprodDescTotal: that.objItensPedidoTemplate[i].zzVprodDesc * that.objItensPedidoTemplate[i].zzQnt,
											zzVprodDesc2: that.objItensPedidoTemplate[i].zzVprodDesc,
											//VALOR DO ITEM QUE VAI SER DILUIDO , PARA JOGAR O VALOR DIRETAMENTE NO ITEM.
											zzQntDiluicao: that.objItensPedidoTemplate[i].zzQntDiluicao,
											tipoItem2: that.objItensPedidoTemplate[i].tipoItem2,
											zzValorDiluido: 0,
											zzVprodABB: that.objItensPedidoTemplate[i].zzVprodABB,
											maxdescpermitido: that.objItensPedidoTemplate[i].maxdescpermitido,
											maxdescpermitidoExtra: that.objItensPedidoTemplate[i].maxdescpermitidoExtra,
											zzQntAmostra: that.objItensPedidoTemplate[i].zzQntAmostra
										};

										vetorAux.push(objAuxItem2);
									}
								}
							}

							PercDescDiluicao = TotalNormal / (TotalNormal + TotalDiluicao);
							PercDescDiluicao = parseFloat((1 - PercDescDiluicao) * 100);

							console.log("Perc. de desconto para ser aplicado nos itens na regra de Diluição " + PercDescDiluicao);

							//APLICA O DESCONTO
							// for (var j = 0; j < that.objItensPedidoTemplate.length; j++) {

							// 	that.oItemPedido.zzVprodDesc = that.oItemPedido.zzVprodDesc - ((that.oItemPedido.zzVprodDesc) * (PercDescDiluicao / 100));
							// 	that.oItemPedido.zzVprodDesc = Math.round(parseFloat(that.oItemPedido.zzVprodDesc * 100)) / 100;

							// }

							for (var j = 0; j < vetorAux.length; j++) {
								if (vetorAux[j].mtpos != "YBRI" && vetorAux[j].mtpos != "YAMO") {
									vetorAux[j].zzVprodDesc = vetorAux[j].zzVprodDesc - ((vetorAux[j].zzVprodDesc) * (PercDescDiluicao / 100));
								}
								// vetorAux[j].zzVprodDesc = Math.round(parseFloat(vetorAux[j].zzVprodDesc * 100)) / 100;
							}

							for (var l = 0; l < that.objItensPedidoTemplate.length; l++) {
								for (var m = 0; m < vetorAux.length; m++) {
									if (vetorAux[m].matnr === that.objItensPedidoTemplate[l].matnr) {
										vetorAux[m].zzQnt += that.objItensPedidoTemplate[l].zzQnt;
										vetorAux[m].zzVprodDescTotal = vetorAux[m].zzVprodDesc * vetorAux[m].zzQnt;
										vetorAux[m].zzVprodDesc = vetorAux[m].zzVprodDesc;
										vetorAux[m].zzQntDiluicao = that.objItensPedidoTemplate[l].zzQntDiluicao;
										vetorAux[m].zzValorDiluido = (Math.round(that.objItensPedidoTemplate[l].zzQntDiluicao * that.objItensPedidoTemplate[l].zzVprodDesc * 100) / 100).toFixed(2);
									}
									vetorAux[m].zzValorDiluido = parseFloat(vetorAux[m].zzValorDiluido);
								}
							}

							for (m = 0; m < vetorAux.length; m++) {
								//Calcula percentual dado
								vetorAux[m].zzPercDescTotal = Math.round((1 - (vetorAux[m].zzVprodDesc / vetorAux[m].zzVprod)) * 10000) / 100;

								//Arredondamento
								vetorAux[m].zzVprodDescTotal = Math.round(parseFloat((vetorAux[m].zzVprodDescTotal) * 10000)) / 10000;
								vetorAux[m].zzVprodDesc = Math.round(parseFloat(vetorAux[m].zzVprodDesc * 10000)) / 10000;
								vetorAux[m].zzVprodDesc = vetorAux[m].zzVprodDesc.toFixed(4);

								//Calculo do percentual Desc Dado
							}

							that.objItensPedidoTemplate = [];
							that.objItensPedidoTemplate = vetorAux;
							var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
							that.getView().setModel(oModel, "ItensPedidoGrid");

							that.onBloqueiaPrePedido();

							console.log("Resultado dos itens da regra de Diluição");
							console.log(vetorAux);

							var storeItensPedido = db.transaction(["ItensPedido"], "readwrite");
							var objItensPedido = storeItensPedido.objectStore("ItensPedido");

							for (var p = 0; p < that.objItensPedidoTemplate.length; p++) {

								var requestADDItem = objItensPedido.put(that.objItensPedidoTemplate[p]);

								requestADDItem.onsuccess = function(e3) {
									console.log("Item adicionado com sucesso");

								};
								requestADDItem.onerror = function(e3) {
									console.log("Falha ao adicionar o Item");
								};
							}

							that.calculaTotalPedido();
							that.setaCompleto(db, "Não");

							that.byId("idDiluirItens").setEnabled(false);
							that.byId("idInserirItemDiluicao").setEnabled(false);
							that.byId("idInserirItem").setEnabled(false);

							// that.byId("idTipoNegociacao").setProperty("enabled", false);
							that.byId("idTabelaPreco").setProperty("enabled", false);
							that.byId("idFormaPagamento").setProperty("enabled", false);
							// that.byId("idTipoTransporte").setProperty("enabled", false);
							// that.byId("idPrimeiraParcela").setProperty("enabled", false);
							// that.byId("idQuantParcelas").setProperty("enabled", false);
							// that.byId("idIntervaloParcelas").setProperty("enabled", false);

							oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
							that.getView().setModel(oModel, "ItensPedidoGrid");
						}
					};
				}
			};
		},

		onInicioBalancoVerbas: function(resolve, reject) {
			//Carrega as tabelas necessarias para fazer os calculos dos excedentes.
			//buscar os campos zzPrzmax/ zzPrzmin/ zzVlrPedMin na tabela de preço
			var that = this;
			var vetorRange = [];
			var percJuros = 0;
			var percJurosDia = 0;
			var prazoMaxAprazo = 0;
			var prazoMaxAprazo = 0;
			var prazoMaxAprazo = 0;
			var prazoMaxAprazo = 0;
			var prazoMaxAprazo = 0;
			var tabPreco = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco");

			var open = indexedDB.open("VB_DataBase");
			open.onerror = function() {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;

				var transaction = db.transaction("Konm", "readonly");
				var objectStore = transaction.objectStore("Konm");

				if ("getAll" in objectStore) {
					objectStore.getAll().onsuccess = function(event) {

						that.vetorRange = event.target.result;

						var transaction1 = db.transaction("A964", "readonly");
						var objectStore1 = transaction1.objectStore("A964");

						if ("getAll" in objectStore1) {
							objectStore1.getAll().onsuccess = function(event) {

								var vetorPerc = event.target.result;

								that.percJuros = parseFloat(vetorPerc[0].zzPerjur);
								that.percJurosDia = that.percJuros / 30;

								var transaction2 = db.transaction("A959", "readonly");
								var objectStore2 = transaction2.objectStore("A959");

								if ("getAll" in objectStore2) {
									objectStore2.getAll().onsuccess = function(event) {

										var perc = event.target.result;

										for (var i = 0; perc.length; i++) {
											if (perc[i].pltyp == tabPreco) {
												var zzPrzmaxap = perc[i].zzPrzmaxap.replace(",", ".");
												var zzPrzminap = perc[i].zzPrzminap.replace(",", ".");
												var zzPrzmaxav = perc[i].zzPrzmaxav.replace(",", ".");
												var zzPrzminav = perc[i].zzPrzminav.replace(",", ".");
												var zzVlrPedMin = perc[i].zzVlrPedMin.replace(",", ".");

												that.prazoMaxAprazo = parseFloat(zzPrzmaxap);
												that.prazoMinAprazo = parseFloat(zzPrzminap);
												that.prazoMaxAvista = parseFloat(zzPrzmaxav);
												that.prazoMinAvista = parseFloat(zzPrzminav);
												that.valorPedMin = parseFloat(zzVlrPedMin);
												break;
											}
										}

										var vetorParametros = [that.prazoMaxAvista, that.prazoMaxAprazo, that.prazoMinAprazo,
											that.prazoMinAvista, that.valorPedMin, that.percJuros, that.percJurosDia
										];

										//Quando termina de carregar as tabelas usadas .. chamar as funções
										//usa apenas vetorRange
										that.onDefineFamilias(that.vetorRange, "Normal");
										that.onDefineFamilias(that.vetorRange, "Extra");
										that.onCalculaPrazoMedio(vetorParametros);

										//Fazer o calculo do que foi excedido
										//Neste momento tenho os percentuais do max permitido de cada item de acordo com as familias cadastradas
										that.onPrecoMinPermitido(that.objItensPedidoTemplate);
										resolve();
										console.log("resolve Perc Descontos");
									};
								}
							};
						}
					};
				}
			};
		},

		onPrecoMinPermitido: function(objItensPedidoTemplate) {
			var that = this;

			for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
				var valorProdutoCheio = that.objItensPedidoTemplate[i].zzVprod;

				//VALOR DO PRODUTO INICIAL É DESCONTADO O PERCENTUAL DA TABELA AVISTA QUANDO TIVER
				if (this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao") === "01") {

					valorProdutoCheio = valorProdutoCheio - (valorProdutoCheio * 5 / 100);

				}

				var valorMinPermitido = valorProdutoCheio - (valorProdutoCheio * parseFloat(that.objItensPedidoTemplate[i].maxdescpermitido) / 100);
				valorMinPermitido = valorMinPermitido - (valorMinPermitido * parseFloat(that.objItensPedidoTemplate[i].maxdescpermitidoExtra) / 100);

				that.objItensPedidoTemplate[i].zzVprodMinPermitido = (valorMinPermitido).toFixed(3);
				console.log("Item :" + that.objItensPedidoTemplate[i].matnr + ", Min Permitido: " + that.objItensPedidoTemplate[i].zzVprodMinPermitido);

			}
		},

		onTablFilterEvent: function(evt) {
			var that = this;
			var item = evt.getParameters();
			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;
				var obrigadoSalvar = that.getOwnerComponent().getModel("modelAux").getProperty("/ObrigaSalvar");

				if (obrigadoSalvar == false) {
					MessageBox.show("Salve o pedido !", {
						icon: MessageBox.Icon.ERROR,
						title: "Atenção!",
						actions: [MessageBox.Action.OK],
						onClose: function() {
							that.byId("idTopLevelIconTabBar").setSelectedKey("tab2");
							that.byId("idLiberarItens").focus();
						}
					});
				} else if (that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco") == "" && item.selectedKey == "tab1" && item.selectedKey == "tab2") {
					MessageBox.show("Escolha uma tabela de preço!", {
						icon: MessageBox.Icon.ERROR,
						title: "Preecher campo(s)",
						actions: [MessageBox.Action.OK],
						onClose: function() {
							that.byId("idTopLevelIconTabBar").setSelectedKey("tab2");
							that.byId("idTabelaPreco").focus();
						}
					});
				} else if (item.selectedKey == "tab6") {

					that.calculaTotalPedido();
					
					that.setaCompleto(db, "Não");
					
					//Atualiza todos os itens do pedido com as propriedades do vetor total de itens.
					that.onAtualizaTodosItensPedido(db);
					
				}
			};
		},
		
		onAtualizaTodosItensPedido: function(db){
			var that = this;
			var storeItensPedido = db.transaction(["ItensPedido"], "readwrite");
			var objItensPedido = storeItensPedido.objectStore("ItensPedido");

			for (var p = 0; p < that.objItensPedidoTemplate.length; p++) {

				if (that.objItensPedidoTemplate[p].tipoItem2 == "Diluicao") {
					
					that.objItensPedidoTemplate[p].zzValExcedidoItem = 0;
				} else {
					
					that.objItensPedidoTemplate[p].zzValExcedidoItem = Math.round(that.objItensPedidoTemplate[p].zzValExcedidoItem * 10000) / 10000;
				}

				that.objItensPedidoTemplate[p].zzVprodDesc2 = (Math.round(that.objItensPedidoTemplate[p].zzVprodDesc2 * 10000) / 10000);
				that.objItensPedidoTemplate[p].zzVprodDesc = (Math.round(that.objItensPedidoTemplate[p].zzVprodDesc * 10000) / 10000);

				that.objItensPedidoTemplate[p].zzVprodDesc2 = that.objItensPedidoTemplate[p].zzVprodDesc2.toFixed(4);
				that.objItensPedidoTemplate[p].zzVprodDesc = that.objItensPedidoTemplate[p].zzVprodDesc.toFixed(4);

				var requestADDItem = objItensPedido.put(that.objItensPedidoTemplate[p]);

				requestADDItem.onsuccess = function(e3) {
					console.log("Itens atualizados com sucesso");

				};
				requestADDItem.onerror = function(e3) {
					console.log("Falha ao atualizar os Itens");
				};
			}
		},

		onDefineFamilias: function(vetorRange, tipoDesconto) {
			var that = this;

			var vetorGeral = that.objItensPedidoTemplate;
			var vetorGeralExtra = that.objItensPedidoTemplate;
			var vetorFamilia = [];
			var proximoItemDiferente = false;
			var percDescPermitido = 0;

			if (tipoDesconto == "Normal") {

				//Ordenando para desconto Familia normal
				vetorGeral.sort(function(a, b) {
					return a.knumh - b.knumh;
				});

				for (var o = 0; o < vetorGeral.length; o++) {

					if (proximoItemDiferente == true) {
						proximoItemDiferente = false;
						percDescPermitido = 0;
						vetorFamilia = [];
					}

					if (vetorFamilia.length == 0 && vetorGeral.length == 1) {

						vetorFamilia.push(vetorGeral[o]);
						this.onBuscaPorcentagem(vetorFamilia, vetorRange, tipoDesconto);

					} else if (vetorGeral.length > 1 && (o + 1) < vetorGeral.length) {

						if (vetorGeral[o].zzGrpmat == vetorGeral[o + 1].zzGrpmat) {

							proximoItemDiferente = false;
							vetorFamilia.push(vetorGeral[o]);

						} else {
							//Nesse momento tenho os itens daquela familia.. tendo os itens da familia .. somar as quantidades
							// e verificar se o desconto aplicado é maior que o permitido.
							//fazendo ( preço cheio - preço de venda )
							vetorFamilia.push(vetorGeral[o]);
							this.onBuscaPorcentagem(vetorFamilia, vetorRange, tipoDesconto);
							proximoItemDiferente = true;
						}

					} else if ((o + 1) == vetorGeral.length) {

						//sinal proximoItemDiferente = true e limpou
						if (vetorFamilia.length > 0) {

							vetorFamilia.push(vetorGeral[o]);
							this.onBuscaPorcentagem(vetorFamilia, vetorRange, tipoDesconto);

						} else {
							//ultimo item e é diferente do antepenultimo
							vetorFamilia.push(vetorGeral[o]);
							this.onBuscaPorcentagem(vetorFamilia, vetorRange, tipoDesconto);
						}
					}
				}
				console.log(that.objItensPedidoTemplate);
			} else if (tipoDesconto == "Extra") {

				//Ordenando para desconto Familia normal
				vetorGeralExtra.sort(function(a, b) {
					var x = a.zzGrpmatExtra.toString();
					var y = b.zzGrpmatExtra.toString();
					if (x < y) {
						return -1;
					}
					if (x > y) {
						return 1;
					}
					return 0;
				});

				for (o = 0; o < vetorGeralExtra.length; o++) {

					if (proximoItemDiferente == true) {
						proximoItemDiferente = false;
						percDescPermitido = 0;
						vetorFamilia = [];
					}

					if (vetorFamilia.length == 0 && vetorGeralExtra.length == 1) {

						vetorFamilia.push(vetorGeralExtra[o]);
						this.onBuscaPorcentagem(vetorFamilia, vetorRange, tipoDesconto);

					} else if (vetorGeralExtra.length > 1 && (o + 1) < vetorGeralExtra.length) {

						if (vetorGeralExtra[o].zzGrpmatExtra == vetorGeralExtra[o + 1].zzGrpmatExtra) {

							proximoItemDiferente = false;
							vetorFamilia.push(vetorGeralExtra[o]);

						} else {
							//Nesse momento tenho os itens daquela familia.. tendo os itens da familia .. somar as quantidades
							// e verificar se o desconto aplicado é maior que o permitido.
							//fazendo ( preço cheio - preço de venda )
							vetorFamilia.push(vetorGeralExtra[o]);
							this.onBuscaPorcentagem(vetorFamilia, vetorRange, tipoDesconto);
							proximoItemDiferente = true;
						}

					} else if ((o + 1) == vetorGeralExtra.length) {

						//sinal proximoItemDiferente = true e limpou
						if (vetorFamilia.length > 0) {

							vetorFamilia.push(vetorGeralExtra[o]);
							this.onBuscaPorcentagem(vetorFamilia, vetorRange, tipoDesconto);

						} else {
							//ultimo item e é diferente do antepenultimo
							vetorFamilia.push(vetorGeralExtra[o]);
							this.onBuscaPorcentagem(vetorFamilia, vetorRange, tipoDesconto);
						}
					}
				}
				console.log(that.objItensPedidoTemplate);
			}
		},

		//Calcula se o item entra no desconto extra e calcula o desconto normal
		onBuscaPorcentagem: function(vetorFamilia, vetorDescontos, tipoDesconto) {
			var that = this;

			var auxRangeQuant = 0;
			var auxRangeQuantExtra = 0;
			var knumh = "";
			var knumhExtra = "";
			var vetorAuxFamilia = [];
			var percDescPermitido = 0;
			var percDescPermitidoExtra = 0;

			if (tipoDesconto == "Normal") {
				for (var u = 0; u < vetorFamilia.length; u++) {
					auxRangeQuant += vetorFamilia[u].zzQnt;
					knumh = vetorFamilia[u].knumh;
				}

				for (var v = 0; v < vetorDescontos.length; v++) {
					if (vetorDescontos[v].knumh === knumh) {
						vetorAuxFamilia.push(vetorDescontos[v]);
					}
				}

				vetorAuxFamilia.sort(function(a, b) {
					return a.kstbm - b.kstbm;
				});

				//Vetor da familia ordenado pela quantidade (menor primeiro), se o kra for menor (break) e usa o desconto.
				//Depois verificar com cada item da do vetorFamilia se o desconto aplicado ultrapassou;
				for (var e = 0; e < vetorAuxFamilia.length; e++) {

					if (auxRangeQuant <= vetorAuxFamilia[e].kstbm) {
						percDescPermitido = vetorAuxFamilia[e].kbetr;
						break;

					} else if (auxRangeQuant > vetorAuxFamilia[e].kstbm) {
						percDescPermitido = vetorAuxFamilia[e].kbetr;
					}
				}

				that.oItemPedido.kbetr = auxRangeQuant;
				console.log("Percentual de Desconto Permitido : " + percDescPermitido + ", Quantidade: " + auxRangeQuant);

				for (u = 0; u < vetorFamilia.length; u++) {
					vetorFamilia[u].maxdescpermitido = percDescPermitido;
				}

				return vetorFamilia;

			} else if (tipoDesconto == "Extra") {

				for (u = 0; u < vetorFamilia.length; u++) {
					auxRangeQuantExtra += vetorFamilia[u].zzQnt;
					knumhExtra = vetorFamilia[u].knumhExtra;
				}

				for (v = 0; v < vetorDescontos.length; v++) {
					if (vetorDescontos[v].knumh === knumhExtra) {
						vetorAuxFamilia.push(vetorDescontos[v]);
					}
				}

				vetorAuxFamilia.sort(function(a, b) {
					return a.kstbm - b.kstbm;
				});

				//Vetor da familia ordenado pela quantidade (menor primeiro), se o kra for menor (break) e usa o desconto.
				//Depois verificar com cada item da do vetorFamilia se o desconto aplicado ultrapassou;
				for (e = 0; e < vetorAuxFamilia.length; e++) {

					if (auxRangeQuantExtra <= vetorAuxFamilia[e].kstbm) {
						percDescPermitidoExtra = vetorAuxFamilia[e].kbetr;
						break;

					} else if (auxRangeQuant > vetorAuxFamilia[e].kstbm) {
						percDescPermitidoExtra = vetorAuxFamilia[e].kbetr;
					}
				}

				that.oItemPedido.kbetr = auxRangeQuantExtra;
				console.log("Percentual de Desconto Extra: " + percDescPermitidoExtra + ", Quantidade: " + auxRangeQuantExtra);

				for (u = 0; u < vetorFamilia.length; u++) {
					vetorFamilia[u].maxdescpermitidoExtra = percDescPermitidoExtra;
				}

				return vetorFamilia;
			}
		},

		onCalculaPrazoMedio: function(vetorParametros) {

			//pre requisito ter executado total do pedido antes de executar essa função
			//Parâmetros pegos do banco antes de executar a função 

			var that = this;
			var diasExcedente = 0;
			var percExcedentePrazoMed = 0;
			var somatoriaParcelas = 0;
			var valorDasparcelas = 0;
			var mediaPonderada = 0;
			var existeEntrada = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ExisteEntradaPedido");
			var intervaloParcelas = parseInt(this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IntervaloParcelas"));
			var quantidadeParcelas = parseInt(this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/QuantParcelas"));
			//TRATATIVA PRA QUANDO FOR FORMA DE PAGAMENTO TIPO J - ANTECIPADO QUE DEVE PASSAR quantidadeParcelas = 0 PRA CRIAÇÃO DO PEDIDO.
			if (quantidadeParcelas == 0) {
				quantidadeParcelas = 1;
			}

			var diasPrimeiraParcela = parseInt(this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DiasPrimeiraParcela"));
			var valorEntradaPedido = parseInt(this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValorEntradaPedido"));
			var percEntradaPedido = parseFloat(this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/PercEntradaPedido"));
			var valTotPed = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotPed");
			var prazoMaxAvista = vetorParametros[0]; //prazoMaxAvista;
			var prazoMaxAprazo = vetorParametros[1]; //prazoMaxAprazo;
			var prazoMinAprazo = vetorParametros[2]; //prazoMinAprazo;
			var prazoMinAvista = vetorParametros[3]; //prazoMinAvista;
			var valorPedMin = vetorParametros[4]; //valorPedMin;
			var percJuros = vetorParametros[5]; //percJuros;
			var percJurosDia = vetorParametros[6]; //percJurosDia;
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercJurosDiaPrazoMedio", percJurosDia);

			if (existeEntrada === false || existeEntrada == "") {
				//Calculo prazo medio normal
				var valorTot = 0;
				var valorAux = 0;

				for (var i = 1; i <= quantidadeParcelas; i++) {
					if (i == 1) {
						var base = diasPrimeiraParcela;
					}
					valorTot += intervaloParcelas * i;
				}

				var prazoMedio = valorTot / quantidadeParcelas;

				if (diasPrimeiraParcela < intervaloParcelas) {
					valorAux = intervaloParcelas - diasPrimeiraParcela;
					prazoMedio = prazoMedio - valorAux;
				} else if (diasPrimeiraParcela > intervaloParcelas) {
					valorAux = diasPrimeiraParcela - intervaloParcelas;
					prazoMedio = prazoMedio + valorAux;
				}
				that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PrazoMedioParcelas", prazoMedio);
				// var prazoMedio = Math.round((parseInt(intervaloParcelas) * parseInt(quantidadeParcelas) + parseInt(diasPrimeiraParcela)) /
				// 	parseInt(quantidadeParcelas) * 100) / 100;
				if (that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao") === "01") {
					if (valTotPed < valorPedMin && prazoMedio >= prazoMinAvista) {

						diasExcedente = prazoMedio - prazoMinAvista;
						percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
						console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
						this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

					} else if (valTotPed < valorPedMin && prazoMedio < prazoMinAvista) {
						//Não gera excedente.
						console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
						this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

					} else if (valTotPed >= valorPedMin && prazoMedio >= prazoMaxAvista) {

						diasExcedente = prazoMedio - prazoMaxAvista;
						percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
						console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
						this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

					} else if (valTotPed >= valorPedMin && prazoMedio < prazoMaxAvista) {
						//Não gera excedente.
						console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
						this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);
					}

				} else if (that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao") === "02") {
					if (valTotPed < valorPedMin && prazoMedio >= prazoMinAprazo) {

						diasExcedente = prazoMedio - prazoMinAprazo;
						percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
						console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
						this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

					} else if (valTotPed < valorPedMin && prazoMedio < prazoMinAprazo) {
						//Não gera excedente.
						console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
						this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

					} else if (valTotPed >= valorPedMin && prazoMedio >= prazoMaxAprazo) {

						diasExcedente = prazoMedio - prazoMaxAprazo;
						percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
						console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
						this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

					} else if (valTotPed >= valorPedMin && prazoMedio < prazoMaxAprazo) {
						//Não gera excedente.
						console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
						this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

					}
				}
			}
			//Quando existe entrada
			else if (existeEntrada === true) {

				if (valorEntradaPedido > 0 || valorEntradaPedido != null || valorEntradaPedido != undefined) {

					valorDasparcelas = Math.round(parseFloat((valTotPed - valorEntradaPedido) / quantidadeParcelas) * 100) / 100;
					var base = 0;
					var valorInterm = 0;
					var dias = 0;

					for (i = 1; i <= quantidadeParcelas + 1; i++) {
						if (i == 1) {
							base = valorEntradaPedido;
							dias = 1;
						} else if (i == 2) {
							dias += diasPrimeiraParcela;
							valorInterm += dias * valorDasparcelas;
						} else {
							dias += intervaloParcelas;
							valorInterm += dias * valorDasparcelas;
						}
					}
					mediaPonderada = (base + valorInterm) / valTotPed;

					// //COMEÇA EM 1 POR QUE A PRIMEIRA PARCELA É DEFINIDO.
					// for (i = 1; i < quantidadeParcelas; i++) {
					// 	somatoriaParcelas += (valorDasparcelas * intervaloParcelas);
					// }

					// mediaPonderada = ((1 * valorDasparcelas) + somatoriaParcelas) / valTotPed;
					mediaPonderada = Math.round(mediaPonderada * 100) / 100;

					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PrazoMedioParcelas", mediaPonderada);

					if (that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao") === "01") {
						if (valTotPed < valorPedMin && mediaPonderada >= prazoMinAvista) {

							diasExcedente = mediaPonderada - prazoMinAvista;
							percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed < valorPedMin && mediaPonderada < prazoMinAvista) {
							//Não gera excedente.
							console.log("Não gerou excedente 1");
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", 0);

						} else if (valTotPed >= valorPedMin && mediaPonderada >= prazoMaxAvista) {

							diasExcedente = mediaPonderada - prazoMaxAvista;
							percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed >= valorPedMin && mediaPonderada < prazoMaxAvista) {
							//Não gera excedente.
							console.log("Não gerou excedente 2");
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", 0);
						}

					} else if (that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao") === "02") {
						if (valTotPed < valorPedMin && mediaPonderada >= prazoMinAprazo) {

							diasExcedente = mediaPonderada - prazoMinAprazo;
							percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed < valorPedMin && mediaPonderada < prazoMinAprazo) {
							//Não gera excedente.
							console.log("Não gerou excedente 3");
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", 0);

						} else if (valTotPed >= valorPedMin && mediaPonderada >= prazoMaxAprazo) {

							diasExcedente = mediaPonderada - prazoMaxAprazo;
							percExcedentePrazoMed = Math.round((Math.round((diasExcedente * (percJurosDia)) * 100) / 100) * 100) / 100;
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed >= valorPedMin && mediaPonderada < prazoMaxAprazo) {
							//Não gera excedente.
							console.log("Não gerou excedente 4");
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", 0);
						}
					}
				} else if (percEntradaPedido > 0 || percEntradaPedido != null || percEntradaPedido != undefined) {

					// valorDasparcelas = (valTotPed - (percEntradaPedido * valTotPed)) / quantidadeParcelas;
					valorEntradaPedido = percEntradaPedido * valTotPed;
					valorDasparcelas = Math.round(parseFloat((valTotPed - valorEntradaPedido) / quantidadeParcelas) * 100) / 100;

					base = 0;
					valorInterm = 0;
					dias = 0;

					for (i = 1; i <= quantidadeParcelas + 1; i++) {
						if (i == 1) {
							base = valorEntradaPedido;
							dias = 1;
						} else if (i == 2) {
							dias += diasPrimeiraParcela;
							valorInterm += dias * valorDasparcelas;
						} else {
							dias += intervaloParcelas;
							valorInterm += dias * valorDasparcelas;
						}
					}
					mediaPonderada = (base + valorInterm) / valTotPed;
					mediaPonderada = Math.round(mediaPonderada * 100) / 100;

					// //COMEÇA EM 1 POR QUE A PRIMEIRA PARCELA É DEFINIDO.
					// for (i = 1; i < quantidadeParcelas; i++) {
					// 	somatoriaParcelas = (valorDasparcelas * intervaloParcelas);
					// }

					// mediaPonderada = ((diasPrimeiraParcela * valorDasparcelas) + somatoriaParcelas) / valTotPed * quantidadeParcelas;
					// mediaPonderada = Math.round(mediaPonderada * 100) / 100;

					that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PrazoMedioParcelas", mediaPonderada);

					if (that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao") === "01") {
						if (valTotPed < valorPedMin && mediaPonderada >= prazoMinAvista) {

							diasExcedente = mediaPonderada - prazoMinAvista;
							percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed < valorPedMin && mediaPonderada < prazoMinAvista) {
							//Não gera excedente.
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed >= valorPedMin && mediaPonderada >= prazoMaxAvista) {

							diasExcedente = mediaPonderada - prazoMaxAvista;
							percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed >= valorPedMin && mediaPonderada < prazoMaxAvista) {
							//Não gera excedente.
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", 0);
						}

					} else if (that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao") === "02") {
						if (valTotPed < valorPedMin && mediaPonderada >= prazoMinAprazo) {

							diasExcedente = mediaPonderada - prazoMinAprazo;
							percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed < valorPedMin && mediaPonderada < prazoMinAprazo) {
							//Não gera excedente.
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", 0);

						} else if (valTotPed >= valorPedMin && mediaPonderada >= prazoMaxAprazo) {

							diasExcedente = mediaPonderada - prazoMaxAprazo;
							percExcedentePrazoMed = Math.round((diasExcedente * (percJurosDia)) * 100) / 100;
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", percExcedentePrazoMed);

						} else if (valTotPed >= valorPedMin && mediaPonderada < prazoMaxAprazo) {
							//Não gera excedente.
							console.log("Perc Excedente: " + percExcedentePrazoMed + ", Dias Excedidos: " + diasExcedente);
							this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercExcedentePrazoMed", 0);

						}
					}
				}
			}

		},

		onNavegaBalancoVenda: function() {

			this.byId("idTopLevelIconTabBar").setSelectedKey("tab6");

		},

		popularCamposItemPedido: function() {
			var that = this;

			sap.ui.getCore().byId("idItemPedido").setValue(that.oItemPedido.matnr);
			sap.ui.getCore().byId("idDescricao").setValue(that.oItemPedido.maktx);
			sap.ui.getCore().byId("idQuantidade").setValue(that.oItemPedido.zzQnt);
			sap.ui.getCore().byId("idVerba").setValue(that.oItemPedido.zzPervm);
			sap.ui.getCore().byId("idComissao").setValue(that.oItemPedido.zzPercom);
			sap.ui.getCore().byId("idPrecoCheio").setValue(that.oItemPedido.zzVprod);
			sap.ui.getCore().byId("idDesconto").setValue(that.oItemPedido.zzDesitem);
			sap.ui.getCore().byId("idImgProduto").setSrc(that.oItemPedido.pathImg);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal);
			// this.getView().setModel(this.getOwnerComponent().setModel("modelItemPedido").setProperty("/valorTotal", that.oItemPedido.zzVprodDescTotal);
			this.getOwnerComponent().getModel("modelItemPedido").setProperty("/valorTotal", that.oItemPedido.zzVprodDescTotal);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal.toString().replace(".", ","));

			// this.getView().getModel().setProperty("/precoVenda", 150.2);
			// sap.ui.getCore().byId("idPrecoDesconto").setValue(that.oItemPedido.zzVprodDescTotal)ç

			var oPanel = sap.ui.getCore().byId("idDialog");
			oPanel.setBusy(false);

		},

		_handleValueHelpSearch: function(evt) {
			var sValue = evt.getSource().getValue();
			var aFilters = [];
			var oFilter = [new sap.ui.model.Filter("matnr", sap.ui.model.FilterOperator.Contains, sValue), new sap.ui.model.Filter(
				"maktx", sap.ui.model.FilterOperator.Contains, sValue)];
			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			sap.ui.getCore().byId("idItemPedido").getBinding("suggestionItems").filter(aFilters);
			sap.ui.getCore().byId("idItemPedido").suggest();
		},

		onDialogCancelButton: function() {
			var that = this;

			if (this._ItemDialog) {
				this._ItemDialog.destroy(true);
			}

			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				that.objItensPedidoTemplate = [];
				var db = open.result;
				var numeroPedido = that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli");

				var store = db.transaction("ItensPedido").objectStore("ItensPedido");
				store.openCursor().onsuccess = function(event1) {
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

		onDialogSubmitButton: function() {

			var that = this;
			var oPanel = sap.ui.getCore().byId("idDialog");
			var itemExistente = false;
			var aux = [];
			var indexEdit = that.getOwnerComponent().getModel("modelAux").getProperty("/EditarindexItem");
			var tipoPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");

			for (var j = 0; j < that.objItensPedidoTemplate.length; j++) {
				if (that.oItemPedido.matnr == that.objItensPedidoTemplate[j].matnr && that.objItensPedidoTemplate[j].tipoItem == "Normal" && (indexEdit == undefined || indexEdit == 0 || indexEdit == "")) {
					itemExistente = true;
					break;
				}
			}

			if (itemExistente == false) {

				if (indexEdit == undefined) {
					that.getOwnerComponent().getModel("modelAux").setProperty("/EditarindexItem", 0);
					indexEdit = 0;
				}

				var nrPedCli = that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli");
				var oPanel = sap.ui.getCore().byId("idDialog");
				var oButtonSalvar = sap.ui.getCore().byId("idButtonSalvarDialog");
				oButtonSalvar.setEnabled(false);

				//Define o index do produto a ser inserido
				for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
					if (i == 0) {
						aux = that.objItensPedidoTemplate[i].idItemPedido.split("/");
						that.indexItem = parseInt(aux[1]);

					} else if (i > 0) {
						aux = that.objItensPedidoTemplate[i].idItemPedido.split("/");

						if (that.indexItem < parseInt(aux[1])) {
							that.indexItem = parseInt(aux[1]);
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
						onClose: function() {
							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
						}
					});
				} else if (sap.ui.getCore().byId("idQuantidade").getValue() === "" || sap.ui.getCore().byId("idQuantidade").getValue() === 0) {

					MessageBox.show("Digite uma quantidade acima de 0.", {
						icon: MessageBox.Icon.ERROR,
						title: "Campo Inválido.",
						actions: [MessageBox.Action.OK],
						onClose: function() {
							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
							sap.ui.getCore().byId("idQuantidade").setValue(1);
						}
					});

				} else if (that.oItemPedido.aumng != 0 && (that.oItemPedido.zzQnt % that.oItemPedido.aumng) != 0 && tipoPedido != "YTRO") {

					MessageBox.show("Digite uma quantidade multipla de " + that.oItemPedido.aumng, {
						icon: MessageBox.Icon.ERROR,
						title: "Quantidade Inválida.",
						actions: [MessageBox.Action.OK],
						onClose: function() {
							
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
						onClose: function() {

							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
							sap.ui.getCore().byId("idQuantidade").setValue(1);

						}
					});

				} else {
					var open = indexedDB.open("VB_DataBase");

					open.onerror = function() {
						oButtonSalvar.setEnabled(true);
						MessageBox.show(open.error.mensage, {
							icon: MessageBox.Icon.ERROR,
							title: "Banco não encontrado!",
							actions: [MessageBox.Action.OK]
						});
					};

					open.onsuccess = function() {
						var db = open.result;
						
						console.error("Campanha Global");
						//Campanha Global 
						//o If exclui se o item que vai ser inserido não é brinde.
						if(that.oItemPedido.mtpos != "YBRI"){
							
							//-> Verifica qual é o grupo e a quantidade permitida que se estiver cadastrado na campanha Global.
							//Senão estiver cadastrado a quantidade e o id e quantidade será 0.
							//Promise criada para carregar primeiro os dados para validar a regra da campanha depois.
							new Promise(function(resolveTopo, rejectTopo){
								
								that.onValidarItensCampanhaGlobal(db, that.oItemPedido, resolveTopo, rejectTopo);
								
							}).then(function(){
								
								that.onAddItemVetor(db, oPanel, indexEdit, nrPedCli, oButtonSalvar);
								
							}).catch(function(){
								
								//Matnr: X não possui Grupo Cmp Global.
								that.onAddItemVetor(db, oPanel, indexEdit, nrPedCli, oButtonSalvar);
								
							});
						} else{
							//Verifica se o item de brinde faz parte da Campanha Global. Se fizer parte o kra não pode add ele sem atender a campanha.
							//1º - Verificar se o item de brinde pertence a campanha. 
							//2º - Se Sim. - Verificar se a quantidade atende pra inserir este item, agrupando pelo ID da Camp Global.
								//- Se atender inserir e validar a quantidade digitada somando todos os brindes do mesmo id de Cmp Global 
								//- Se ultrapassar validar quantidade permitida. 
							//3º - Senão deixa inserir normalmente.
							new Promise(function(res, rej){
								
								that.onCheckBrindeCampanhaGlobal(db, that.oItemPedido, res, rej);
								
							}).then(function(){
								
								//Variavel pra identificar se o item participa da campanha Global. (Não e Sim)
								that.oItemPedido.zzUtilCampGlobal = "Sim";
								that.oItemPedido.zzAtingiuCmpGlobal = 0;
								
								that.onAddItemVetor(db, oPanel, indexEdit, nrPedCli, oButtonSalvar);
								
							}).catch(function(mensagemCmpGlobal){
								
								that.oItemPedido.zzGrupoGlobal = 0;
								that.oItemPedido.zzQntRegraGb = 0;
								that.oItemPedido.zzAtingiuCmpGlobal = 0;
								
								//Variavel pra identificar se o item participa da campanha Global. (Não e Sim)
								that.oItemPedido.zzUtilCampGlobal = "Não";
								
								if(mensagemCmpGlobal == "Pode inserir normalmente"){
									
									that.onAddItemVetor(db, oPanel, indexEdit, nrPedCli, oButtonSalvar);
									
								} else{
									
									MessageBox.show(mensagemCmpGlobal, {
										icon: MessageBox.Icon.ERROR,
										title: "Brinde inválido.",
										actions: [MessageBox.Action.YES],
										onClose: function() {
											// that.onResetaCamposDialog();
											// sap.ui.getCore().byId("idItemPedido").setValue();
											sap.ui.getCore().byId("idQuantidade").focus();
											oPanel.setBusy(false);
											oButtonSalvar.setEnabled(true);
											
										}
									});
								}
							});
						}
						
						console.error("Fim Campanha Global");
						
					};
				}
			} else {
				MessageBox.show("Produto: " + that.oItemPedido.matnr + " já inserido na lista de itens!", {
					icon: MessageBox.Icon.ERROR,
					title: "Produto já inserido.",
					actions: [MessageBox.Action.YES],
					onClose: function() {
						that.onResetaCamposDialog();
						sap.ui.getCore().byId("idItemPedido").setValue();
						sap.ui.getCore().byId("idItemPedido").focus();
						oPanel.setBusy(false);
					}
				});
			}
		},
		
		onAddItemVetor: function(db, oPanel, indexEdit, nrPedCli, oButtonSalvar){
			var that = this;
			var store = db.transaction("Materiais", "readwrite");
			var objMaterial = store.objectStore("Materiais");
	
			var requestMaterial = objMaterial.get(sap.ui.getCore().byId("idItemPedido").getValue());
	
			requestMaterial.onsuccess = function(e) {
				var oMaterial = e.target.result;
	
				if (oMaterial == undefined) {
					oPanel.setBusy(false);
	
					MessageBox.show("Não existe o produto: " + sap.ui.getCore().byId("idItemPedido").getValue(), {
						icon: MessageBox.Icon.ERROR,
						title: "Produto não encontrado.",
						actions: [MessageBox.Action.YES],
						onClose: function() {
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
	
					request.onsuccess = function(e3) {
	
						var result2 = e3.target.result;
						
						//preparar o obj a ser adicionado ou editado
						if (result2 == undefined) {
	
							that.getOwnerComponent().getModel("modelAux").setProperty("/UltimoindexItem", nrPedCli + "/" + (that.indexItem));
							that.oItemPedido.idItemPedido = that.getOwnerComponent().getModel("modelAux").getProperty("/UltimoindexItem");
							that.oItemPedido.index = that.indexItem;
							that.oItemPedido.nrPedCli = nrPedCli;
	
						} else {
							//OBJ ENCONTRADO NO BANCO... ATUALIZA ELE.
							that.oItemPedido.idItemPedido = that.getOwnerComponent().getModel("modelAux").getProperty("/EditarindexItem");
						}
	
						var pAtualizarItem = new Promise(function(resII, rejII) {
							if (that.oItemPedido.mtpos == "YAMO") {
								that.onConsumirSaldoAmostra(db, that.oItemPedido, resII, rejII, that.oItemPedido.zzQnt);
							} else {
								resII();
							}
						});
	
						pAtualizarItem.then(function() {
							/* Se for inserção */
							if (result2 == undefined) {
								that.objItensPedidoTemplate.push(that.oItemPedido);
								console.log("Item: " + that.oItemPedido.index + " adicionado com sucesso");

							} else {
								for (var j = 0; j < that.objItensPedidoTemplate.length; j++) {
									if (that.objItensPedidoTemplate[j].idItemPedido === that.oItemPedido.idItemPedido) {
										that.objItensPedidoTemplate[j] = that.oItemPedido;
									}
								}
								console.log("Item: " + that.oItemPedido.index + " foi Atualizado");
							}
							
							//2º Campanha Global após todas as inserções realizadas
							//Promise para agrupar os itens e identificar se possui grupo de familia e o range de quantidade.
							new Promise(function(res, rej){
								
								that.onAgrupaItensGlobal(res, rej, that);
								
							}).then(function(){
								
								storeItensPedido = db.transaction(["ItensPedido"], "readwrite");
								objItensPedido = storeItensPedido.objectStore("ItensPedido");
								
								var requestPutItens = objItensPedido.put(that.oItemPedido);
								
								requestPutItens.onsuccess = function() {
									
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
								
								requestPutItens.onerror = function(event) {
									console.log(" Dados itensPedido não foram inseridos");
		
									oButtonSalvar.setEnabled(true);
		
									if (that._ItemDialog) {
										that._ItemDialog.destroy(true);
									}
							};
							
							}).catch(function() {
								
								oButtonSalvar.setEnabled(true);
								return;
							});
						});
					};
				}
			};
		},
		
		onCheckBrindeCampanhaGlobal: function(db, oItemPedido, res, rej){
			var that = this;
			var oPanel = sap.ui.getCore().byId("idDialog");
			//Armazena quantas vezes os brindes podem ser usados
			var qntRangeProdutos = 0;
			var totalItensPermitidos = 0;
			var mensagemCmpGlobal = "";
			var qntTotalItensJaInseridos = 0;
			
			var objStore = db.transaction("CmpGbItensBrindes", "readwrite");
			var objCmpGbItensBrindes = objStore.objectStore("CmpGbItensBrindes");
			var indexItensBrindes = objCmpGbItensBrindes.index("material");
			
			var requestIndexItensBrindes = indexItensBrindes.get(oItemPedido.matnr);
			
			requestIndexItensBrindes.onsuccess = function(e) {
				var oBrinde = e.target.result;
				
				//Esse if verifica se o brinde inserido está contido em campanha.
				//Produto encontrado na lista dos brinde. Pode inserir apenas se atender a quantidade de itens para ativar a promoção. Senão 
				//1º Agrupar os brindes de acordo com o id da campanha.
				//2º Verificar se atingiu a quantidade de acordo com o grupo da campanha.
				//3º Verificar se a quantidade digitada ultrapassa o limite permitido de brinde.
				
				if (oBrinde == undefined) {
					
					//Pode inserir normalmente o item de brinde, gerando excedente de brinde.
					mensagemCmpGlobal = "Pode inserir normalmente";
					rej(mensagemCmpGlobal);
					
				} else{
					
					//Encontrou o brinde na campanha Global. Agora tem que verificar se o item atinge a quantidade para utilizar os brindes.
					//Depois verificar se a quantidade digitada ultrapassa o limite permitido do item.
					oPanel.setBusy(false);
					
					//Parâmetro para verificar qual o grupo que o brinde pertence.
					oItemPedido.zzGrupoGlobal = oBrinde.grupo;
					
					var objStoreBrindeCmpGlobal = db.transaction("CmpGbQtdItens", "readwrite");
					var objCmpGbQtdItens = objStoreBrindeCmpGlobal.objectStore("CmpGbQtdItens");
					var indexCmpGbQtdItens = objCmpGbQtdItens.index("grupo");
					
					var requestCmpGbQtdItens = indexCmpGbQtdItens.get(oItemPedido.zzGrupoGlobal);
					
					requestCmpGbQtdItens.onsuccess = function(e) {
						var oBrindeRange = e.target.result;
						
						if(!oBrindeRange){
							mensagemCmpGlobal = "Cadastro do range de brindes não cadastrado para a Campanha Global.";
							rej(mensagemCmpGlobal);
						}
						
						//Quantidade de range permitido para o brinde. 
						oItemPedido.zzQntRegraGb = oBrindeRange.quantidade;
						
						//Insere o item corrente para contabilizar a somatoria dos itens de brindes digitada por ID campanha global. se for == 0 sinal que é item novo,
						// e item novo não está contido no vetor objItensPedidoTemplate
						if(that.getOwnerComponent().getModel("modelAux").getProperty("/EditarindexItem") == 0){
							qntTotalItensJaInseridos = oItemPedido.zzQnt;
						}
						
						//Verifica a quantidade de brindes que pode utilizar de acordo com a quantidade normais de itens inseridos.
						//Somar todas as quantidades de brindes já inseridos daquele id de campanha global. Mais a quantidade do item corrente (que está sendo inserido).
						for(var i=0; i<that.objItensPedidoTemplate.length; i++){
							if(that.objItensPedidoTemplate[i].zzGrupoGlobal == oItemPedido.zzGrupoGlobal){
								//Consultar quantas vezes esse id atingiu a quantidade para utilizar a campanha.
								//EX: zzAtingiuCmpGlobal = 2. Significa que atingiu 2 x 20 unidades. Então ele pode inserir 2x o combo de brindes.
								if(that.objItensPedidoTemplate[i].zzAtingiuCmpGlobal){
									
									qntRangeProdutos = that.objItensPedidoTemplate[i].zzAtingiuCmpGlobal;
								}
								//Contabiliza a quantidade de itens de brinde já inseridos com o id da campanha corrente do item que está sendo editado/novo.
								if(that.objItensPedidoTemplate[i].mtpos == "YBRI"){
									qntTotalItensJaInseridos += that.objItensPedidoTemplate[i].zzQnt;
								}
							}
						}
						
						//Não atingiu a quantidade de itens necessarios.
						if(qntRangeProdutos == 0){
							mensagemCmpGlobal = "Quantidade de itens permitidos para inserir de acordo com o range atingido: " + totalItensPermitidos;
							rej(mensagemCmpGlobal);
						}
						
						// Valor total permitido inserir de itens de brindes.
						totalItensPermitidos = oItemPedido.zzQntRegraGb * qntRangeProdutos;
						
						//O kra digitou uma quantidade maior que o permitido. Barrar e gerar uma mensagem pra ele.
						
						if(totalItensPermitidos < qntTotalItensJaInseridos){
							//Ultrapassou a quantidade permitida de itens
							mensagemCmpGlobal = "Quantidade de itens permitidos para inserir de acordo com o range atingido: " + totalItensPermitidos + ". Quantidade de itens já inseridos: " + qntTotalItensJaInseridos;
							rej(mensagemCmpGlobal);
							
						} else{
							//Atendeu todas as expectativas e consegue usar a quantidade.
							res();
						}
					};
				}
			};
		},

		onDialogDiluicaoSubmitButton: function() {

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

			if (itemJaInseridoDiluicao == true) {

				MessageBox.show("Item de diluição já inserido!", {
					icon: MessageBox.Icon.ERROR,
					title: "Item inválido.",
					actions: [MessageBox.Action.OK],
					onClose: function() {
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
						onClose: function() {
							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
						}
					});
				} else if (sap.ui.getCore().byId("idQuantidade").getValue() === "" || sap.ui.getCore().byId("idQuantidade").getValue() === 0) {

					MessageBox.show("Digite uma quantidade acima de 0.", {
						icon: MessageBox.Icon.ERROR,
						title: "Campo Inválido.",
						actions: [MessageBox.Action.OK],
						onClose: function() {
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
						onClose: function() {

							oPanel.setBusy(false);
							oButtonSalvar.setEnabled(true);
							sap.ui.getCore().byId("idQuantidade").setValue(1);

						}
					});

				} else {
					var open = indexedDB.open("VB_DataBase");

					open.onerror = function() {

						MessageBox.show(open.error.mensage, {
							icon: MessageBox.Icon.ERROR,
							title: "Banco não encontrado!",
							actions: [MessageBox.Action.OK],
							onClose: function() {
								oButtonSalvar.setEnabled(true);
							}
						});
					};

					open.onsuccess = function() {
						var db = open.result;

						var store = db.transaction("Materiais", "readwrite");
						var objMaterial = store.objectStore("Materiais");

						var requestMaterial = objMaterial.get(sap.ui.getCore().byId("idItemPedido").getValue());

						requestMaterial.onsuccess = function(e) {
							var oMaterial = e.target.result;

							if (oMaterial == undefined) {
								oPanel.setBusy(false);

								MessageBox.show("Não existe o produto: " + sap.ui.getCore().byId("idItemPedido").getValue(), {
									icon: MessageBox.Icon.ERROR,
									title: "Produto não encontrado.",
									actions: [MessageBox.Action.YES],
									onClose: function() {
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
								requestADDItem.onsuccess = function(e3) {

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
								requestADDItem.onerror = function(e3) {
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
		onNovoItem: function() {
			console.log("onitempress standard");
			var that = this;

			var statusPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			var tipoPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");
			that.oItemPedido = [];

			if (statusPedido == 3 || statusPedido == 2 || statusPedido == 9) {
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
			}
		},

		onNovoItemDiluicao: function() {
			var that = this;

			var statusPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			that.oItemPedido = [];

			if (statusPedido == 3 || statusPedido == 2 || statusPedido == 9) {
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
						"testeui5.view.ItemDiluicaoDialog",
						this
					);
					this.getView().addDependent(this._ItemDialog);
				}

				var itensDiluicao = [];
				var materiais = this.getView().getModel("materiaisCadastrados");

				for (var t = 0; t < materiais.oData.length; t++) {

					if (materiais.oData[t].mtpos !== "YAMO" && materiais.oData[t].mtpos !== "YBRI") {
						itensDiluicao.push(materiais.oData[t]);
					}
				}

				var oModel = new sap.ui.model.json.JSONModel(itensDiluicao);
				that.getView().setModel(oModel, "materiaisCadastradosDiluicao");

				this._ItemDialog.open();
				this.getOwnerComponent().getModel("modelAux").setProperty("/IserirDiluicao", true);
				sap.ui.getCore().byId("idItemPedido").focus();
			}
		},

		onEditarItemPress: function(oEvent) {
			var that = this;
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			var statusPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			//VARIAVEL QUE MOSTRA UM ITEM ESTÁ SENDO EDITADO
			var itemPedido = oItem.getBindingContext("ItensPedidoGrid").getProperty("idItemPedido");
			that.getOwnerComponent().getModel("modelAux").setProperty("/EditarindexItem", itemPedido);
			var tipoPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");

			if (statusPedido == 3 || statusPedido == 2 || statusPedido == 9) {

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

				if (that.oItemPedido.tipoItem == "Diluicao" | tipoPedido == "YBON" | tipoPedido == "YTRO") {
					sap.ui.getCore().byId("idDesconto").setEnabled(false);
				} else {
					sap.ui.getCore().byId("idDesconto").setEnabled(true);
				}

				sap.ui.getCore().byId("idItemPedido").setEnabled(false);

				if (that.oItemPedido.tipoItem == "Diluido") {
					sap.ui.getCore().byId("idItemPedido").setEnabled(false);
					sap.ui.getCore().byId("idQuantidade").setEnabled(false);
					sap.ui.getCore().byId("idDesconto").setEnabled(false);
				}
			}
		},

		onDeletarItemPedido: function(oEvent) {
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			var idItemPedido = oItem.getBindingContext("ItensPedidoGrid").getProperty("idItemPedido");
			var idItem = oItem.getBindingContext("ItensPedidoGrid").getProperty("matnr");
			var statusPedido = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			if (statusPedido == 3 || statusPedido == 2 || statusPedido == 9) {

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
					onClose: function(oAction) {
						if (oAction === "Excluir") {

							for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
								if (that.objItensPedidoTemplate[i].idItemPedido === idItemPedido) {

									that.objItensPedidoTemplate.splice(i, 1);

									if (that.objItensPedidoTemplate.length === 0) {

										// that.byId("idTipoNegociacao").setProperty("enabled", true);
										that.byId("idTabelaPreco").setProperty("enabled", true);
										that.byId("idFormaPagamento").setProperty("enabled", true);
										// that.byId("idTipoTransporte").setProperty("enabled", true);
										// that.byId("idPrimeiraParcela").setProperty("enabled", true);
										// that.byId("idQuantParcelas").setProperty("enabled", true);
										// that.byId("idIntervaloParcelas").setProperty("enabled", true);

										// that.byId("idDiluirItens").setEnabled(false);
										// that.byId("idInserirItemDiluicao").setEnabled(true);
										that.byId("idInserirItem").setEnabled(true);

									}
								}
							}
							var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
							that.getView().setModel(oModel, "ItensPedidoGrid");

							that.onBloqueiaPrePedido();

							var open = indexedDB.open("VB_DataBase");
							open.onerror = function() {
								MessageBox.show(open.error.mensage, {
									icon: MessageBox.Icon.ERROR,
									title: "Banco não encontrado!",
									actions: [MessageBox.Action.OK]
								});
							};

							open.onsuccess = function() {
								var db = open.result;

								that.setaCompleto(db, "Não");
								that.calculaTotalPedido();

								var store1 = db.transaction("ItensPedido", "readwrite");
								var objPedido = store1.objectStore("ItensPedido");

								var request = objPedido.delete(idItemPedido);
								request.onsuccess = function() {
									console.log("Item com ID: " + idItemPedido + " foi deletado!");
								};
								request.onerror = function() {
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

		onFinalizarPedido: function() {

			//Percorre os itens do pesdido para fazer uma verificação se realmente não tem produto repetido.
			var that = this;
			var idStatusPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			var valorParcelas = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValParcelasPedido");
			var formaPagamento = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/FormaPagamento");
			var tipoPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");
			var codCliente = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");

			if (idStatusPedido == 3 || idStatusPedido == 2 || idStatusPedido == 9) {

				MessageBox.show("Este pedido não pode mais ser alterado", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK]
				});

			} else if (valorParcelas < 300 && formaPagamento == "D" && tipoPedido != "U") {

				MessageBox.show("Pedido deve ter um parcelamento maior que R$: 300,00.", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK]
				});

			} else if (codCliente == undefined || codCliente == "") {

				MessageBox.show("Esse pedido está sem cliente. Retorne no menu de pedidos e escolha o cliente novamente.", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK],
					onClose: function() {
						sap.ui.core.UIComponent.getRouterFor(that).navTo("pedido");
					}
				});

			} else {

				//HRIMP E DATIMP
				var data = this.onDataAtualizacao();
				var horario = data[1];

				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/SituacaoPedido", "PEN");
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
				// else if (itemDuplicado == true) {
				// 	MessageBox.show("O pedido possui itens duplicados. Favor rever sua lista de itens!", {
				// 		icon: MessageBox.Icon.ERROR,
				// 		title: "Falha ao Completar Pedido.",
				// 		actions: [MessageBox.Action.OK]
				// 	});
				// } 
				else {
					//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Atualizando o PrePedido PEDIDO NO BANCO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
					var open = indexedDB.open("VB_DataBase");

					open.onerror = function() {
						MessageBox.show(open.error.mensage, {
							icon: MessageBox.Icon.ERROR,
							title: "Falha ao abrir o banco para inserir os dados do pedido!",
							actions: [MessageBox.Action.OK]
						});
					};

					open.onsuccess = function() {
						var db = open.result;

						if (completoPedido == "Não") {

							if (that.getOwnerComponent().getModel("modelAux").getProperty("/Tipousuario") == 2) {
								that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IdStatusPedido", 9);
								that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/SituacaoPedido", "Preposto");
							}else{
								that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IdStatusPedido", 2);
							}

							var objBancoPrePedido = {
								nrPedCli: that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"),
								kunnr: that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr"),
								werks: that.getOwnerComponent().getModel("modelAux").getProperty("/Werks"),
								codRepres: that.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres"),
								tipoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido"),
								//idStatusPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido"),
								idStatusPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido"), /* Forço o status para finalizado */
								situacaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/SituacaoPedido"),
								tabPreco: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco"),
								completo: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Completo"),
								valMinPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValMinPedido"),
								dataPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DataPedido"),
								dataImpl: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DataImpl"),
								// valComissao: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValComissao"),
								observacaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ObservacaoPedido"),
								observacaoAuditoriaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ObservacaoAuditoriaPedido"),
								existeEntradaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ExisteEntradaPedido"),
								percEntradaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/PercEntradaPedido"),
								valorEntradaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValorEntradaPedido"),
								tipoTransporte: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoTransporte"),
								diasPrimeiraParcela: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DiasPrimeiraParcela"),
								quantParcelas: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/QuantParcelas"),
								intervaloParcelas: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IntervaloParcelas"),
								tipoNegociacao: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao"),
								ntgew: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Ntgew"),
								valTotPed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotPed"),
								valDescontoTotal: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValDescontoTotal"),
								valTotalExcedentePrazoMed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedentePrazoMed"),
								valTotalExcedenteDesconto: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteDesconto"),
								totalItensPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TotalItensPedido"),
								valCampEnxoval: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValCampEnxoval"),
								valCampBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValCampBrinde"),
								valCampGlobal: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValCampGlobal"),
								valVerbaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValVerbaPedido"),
								valComissaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValComissaoPedido"),
								valComissaoUtilizadaDesconto: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValComissaoUtilizadaDesconto"),
								valVerbaUtilizadaDesconto: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValVerbaUtilizadaDesconto"),
								valUtilizadoComissaoPrazoMed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoPrazoMed"),
								valTotalExcedenteNaoDirecionadoDesconto: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteNaoDirecionadoDesconto"),
								valTotalExcedenteNaoDirecionadoPrazoMed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteNaoDirecionadoPrazoMed"),
								valTotalExcedenteNaoDirecionadoBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteNaoDirecionadoBrinde"),
								valTotalExcedenteNaoDirecionadoAmostra: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteNaoDirecionadoAmostra"),
								valTotalExcedenteNaoDirecionadoBonif: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteNaoDirecionadoBonif"),
								valTotalAbatidoComissao: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalAbatidoComissao"),
								valTotalAbatidoVerba: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalAbatidoVerba"),
								valTotalCampGlobal: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalCampGlobal"),
								valUtilizadoCampBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampBrinde"),
								valTotalCampBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalCampBrinde"),
								valUtilizadoCampGlobal: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampGlobal"),
								valTotalCampEnxoval: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalCampEnxoval"),
								valUtilizadoCampEnxoval: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampEnxoval"),
								valTotalCampProdutoAcabado: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalCampProdutoAcabado"),
								valUtilizadoCampProdutoAcabado: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampProdutoAcabado"),
								valTotalExcedenteBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteBrinde"),
								valUtilizadoVerbaBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaBrinde"),
								valUtilizadoVerbaPrazoMed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaPrazoMed"),
								valUtilizadoComissaoBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoBrinde"),
								valTotalExcedenteAmostra: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteAmostra"),
								valUtilizadoVerbaAmostra: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaAmostra"),
								valUtilizadoComissaoAmostra: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoAmostra"),
								valTotalExcedenteBonif: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteBonif"),
								valUtilizadoVerbaBonif: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaBonif"),
								valUtilizadoComissaoBonif: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoBonif"),
								codUsr: that.getOwnerComponent().getModel("modelAux").getProperty("/CodUsr"),
								tipoUsuario: that.getOwnerComponent().getModel("modelAux").getProperty("/Tipousuario"),
								verificadoPreposto: true,
								zlsch: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/FormaPagamento"),
								zzPrazoMedio: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/PrazoMedioParcelas")
							};

							var store1 = db.transaction("PrePedidos", "readwrite");
							var objPedido = store1.objectStore("PrePedidos");
							var request = objPedido.put(objBancoPrePedido);

							request.onsuccess = function() {
								// that.atualizaMovtoVerba(db);
								that.setaCompleto(db, "Sim");
								that.onResetarCamposPrePedido();
								that.oItemTemplate = [];
								console.log("Pedido inserido");
							};

							request.onerror = function() {
								console.log("Pedido não foi Inserido!");
							};
						}

						MessageBox.show("Deseja enviar o pedido agora ?", {
							icon: MessageBox.Icon.ERROR,
							title: "Atenção",
							actions: [MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function(oAction) {
								if (oAction == sap.m.MessageBox.Action.YES) {
									that.getOwnerComponent().getModel("modelAux").setProperty("/bEnviarPedido", true);
									sap.ui.core.UIComponent.getRouterFor(that).navTo("enviarPedidos");
									that.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
								}
								if (oAction == sap.m.MessageBox.Action.NO) {
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

		onLiberarItensPedido: function() {
			var that = this;

			var idStatusPedido = that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido");
			var codCliente = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");

			if (idStatusPedido == 3 || idStatusPedido == 2 || idStatusPedido == 9) {

				MessageBox.show("Este pedido não pode mais ser alterado", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK]
				});

			} else if (codCliente == undefined || codCliente == "") {

				MessageBox.show("Esse pedido está sem cliente. Retorne no menu de pedidos e escolha o cliente novamente.", {
					icon: MessageBox.Icon.WARNING,
					title: "Não Permitido",
					actions: [MessageBox.Action.OK],
					onClose: function() {
						sap.ui.core.UIComponent.getRouterFor(that).navTo("pedido");
					}
				});

			} else {
				var date = new Date();
				this.getOwnerComponent().getModel("modelAux").setProperty("/ObrigaSalvar", true);
				
				if (this.byId("idTipoPedido").getSelectedKey() == "" || this.byId("idTipoPedido").getSelectedKey() == undefined) {
					MessageBox.show("Preencher o tipo do pedido!", {
						icon: MessageBox.Icon.ERROR,
						title: "Corrigir o campo!",
						actions: [MessageBox.Action.OK]
					});
				} else if (this.byId("idTabelaPreco").getSelectedKey() == "" || this.byId("idTabelaPreco").getSelectedKey() == undefined) {
					MessageBox.show("Preencher a tabela de preço!", {
						icon: MessageBox.Icon.ERROR,
						title: "Corrigir o campo!",
						actions: [MessageBox.Action.OK]
					});
				} else if (((this.byId("idTipoPedido").getSelectedKey() == "YBON" && this.byId("idTipoPedido").getSelectedKey() == "YTRO") && this.byId("idFormaPagamento").getSelectedKey() == "") || ((this.byId("idTipoPedido").getSelectedKey() == "YBON" && this.byId("idTipoPedido").getSelectedKey() == "YTRO") && this.byId("idFormaPagamento").getSelectedKey() == undefined)) {
					MessageBox.show("Preencher o forma de pagamento!", {
						icon: MessageBox.Icon.ERROR,
						title: "Corrigir o campo!",
						actions: [MessageBox.Action.OK],
						onClose: function() {
							that.byId("idFormaPagamento").focus();
						}
					});
				} else {
					// that.objItensPedidoTemplate = [];
					// var oModel = new sap.ui.model.json.JSONModel(that.objItensPedidoTemplate);
					// this.getView().setModel(oModel, "ItensPedidoGrid");

					this.byId("tabItensPedidoStep").setProperty("enabled", true);
					// this.byId("tabBalancoVerbaStep").setProperty("enabled", true);
					this.byId("tabTotalStep").setProperty("enabled", true);
					// this.byId("tabItensDiluicaoPedidoStep").setProperty("enabled", true);

					var open = indexedDB.open("VB_DataBase");
					open.onerror = function(hxr) {
						console.log("falha abrir tabela PrePedido as tabelas");
					};
					//Load tables
					open.onsuccess = function() {
						var db = open.result;

						var tx = db.transaction("PrePedidos", "readwrite");
						var objPrePedido = tx.objectStore("PrePedidos");

						var request = objPrePedido.get(that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"));

						request.onsuccess = function(e) {
							var result = e.target.result;

							var objBancoPrePedido = {
								nrPedCli: that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"),
								kunnr: that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr"),
								werks: that.getOwnerComponent().getModel("modelAux").getProperty("/Werks"),
								codRepres: that.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres"),
								tipoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido"),
								idStatusPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IdStatusPedido"),
								situacaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/SituacaoPedido"),
								tabPreco: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TabPreco"),
								completo: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Completo"),
								valMinPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValMinPedido"),
								dataPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DataPedido"),
								dataImpl: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DataImpl"),
								// valComissao: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValComissao"),
								observacaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ObservacaoPedido"),
								observacaoAuditoriaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ObservacaoAuditoriaPedido"),
								existeEntradaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ExisteEntradaPedido"),
								percEntradaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/PercEntradaPedido"),
								valorEntradaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValorEntradaPedido"),
								tipoTransporte: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoTransporte"),
								diasPrimeiraParcela: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/DiasPrimeiraParcela"),
								quantParcelas: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/QuantParcelas"),
								intervaloParcelas: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/IntervaloParcelas"),
								tipoNegociacao: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoNegociacao"),
								ntgew: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/Ntgew"),
								valTotPed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotPed"),
								valDescontoTotal: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValDescontoTotal"),
								valTotalExcedentePrazoMed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedentePrazoMed"),
								valTotalExcedenteDesconto: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteDesconto"),
								totalItensPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TotalItensPedido"),
								valCampEnxoval: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValCampEnxoval"),
								valCampBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValCampBrinde"),
								valCampGlobal: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValCampGlobal"),
								valVerbaPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValVerbaPedido"),
								valComissaoPedido: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValComissaoPedido"),
								valComissaoUtilizadaDesconto: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValComissaoUtilizadaDesconto"),
								valVerbaUtilizadaDesconto: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValVerbaUtilizadaDesconto"),
								valUtilizadoComissaoPrazoMed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoPrazoMed"),
								valTotalExcedenteNaoDirecionadoDesconto: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteNaoDirecionadoDesconto"),
								valTotalExcedenteNaoDirecionadoPrazoMed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteNaoDirecionadoPrazoMed"),
								valTotalAbatidoComissao: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalAbatidoComissao"),
								valTotalAbatidoVerba: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalAbatidoVerba"),
								valTotalCampGlobal: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalCampGlobal"),
								valUtilizadoCampBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampBrinde"),
								valUtilizadoCampGlobal: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampGlobal"),
								valTotalCampEnxoval: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalCampEnxoval"),
								valUtilizadoCampEnxoval: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampEnxoval"),
								valTotalCampProdutoAcabado: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalCampProdutoAcabado"),
								valUtilizadoCampProdutoAcabado: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoCampProdutoAcabado"),
								valTotalExcedenteBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteBrinde"),
								valUtilizadoVerbaBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaBrinde"),
								valUtilizadoVerbaPrazoMed: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaPrazoMed"),
								valUtilizadoComissaoBrinde: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoBrinde"),
								valTotalExcedenteAmostra: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteAmostra"),
								valUtilizadoVerbaAmostra: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaAmostra"),
								valUtilizadoComissaoAmostra: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoAmostra"),
								valTotalExcedenteBonif: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValTotalExcedenteBonif"),
								valUtilizadoVerbaBonif: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoVerbaBonif"),
								valUtilizadoComissaoBonif: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/ValUtilizadoComissaoBonif"),
								codUsr: that.getOwnerComponent().getModel("modelAux").getProperty("/CodUsr"),
								tipoUsuario: that.getOwnerComponent().getModel("modelAux").getProperty("/Tipousuario"),
								verificadoPreposto: false,
								zlsch: that.getOwnerComponent().getModel("modelDadosPedido").getProperty("/FormaPagamento")
							};

							//ADICIONAR O OBJ .. QND FOR UNDEFINED, POIS O OBJ NÃO FOI ENCONTRADO, ESTÁ VAZIO.
							if (result == undefined || result == null) {

								var request1 = objPrePedido.add(objBancoPrePedido);

								objBancoPrePedido = {
									nrPedCli: "",
									kunnr: "",
									werks: "",
									codRepres: "",
									tipoPedido: "",
									idStatusPedido: "",
									situacaoPedido: "",
									tabPreco: "",
									completo: "",
									valMinPedido: "",
									dataPedido: "",
									dataImpl: "",
									valComissao: "",
									observacaoPedido: "",
									observacaoAuditoriaPedido: "",
									existeEntradaPedido: "",
									percEntradaPedido: "",
									valorEntradaPedido: "",
									tipoTransporte: "",
									diasPrimeiraParcela: "",
									quantParcelas: "",
									intervaloParcelas: "",
									tipoNegociacao: "",
									ntgew: "",
									valTotPed: "",
									valDescontoTotal: "",
									valTotalExcedentePrazoMed: "",
									valTotalExcedenteDesconto: "",
									totalItensPedido: "",
									valCampEnxoval: "",
									valCampBrinde: "",
									valCampGlobal: "",
									valVerbaPedido: "",
									valComissaoPedido: "",
									valComissaoUtilizadaDesconto: "",
									valVerbaUtilizadaDesconto: "",
									valUtilizadoComissaoPrazoMed: "",
									valTotalExcedenteNaoDirecionadoDesconto: "",
									valTotalExcedenteNaoDirecionadoPrazoMed: "",
									valTotalAbatidoComissao: "",
									valTotalAbatidoVerba: "",
									valTotalCampGlobal: "",
									valUtilizadoCampBrinde: "",
									valUtilizadoCampGlobal: "",
									valTotalCampEnxoval: "",
									valUtilizadoCampEnxoval: "",
									valTotalCampProdutoAcabado: "",
									valUtilizadoCampProdutoAcabado: "",
									valTotalExcedenteBrinde: "",
									valUtilizadoVerbaBrinde: "",
									valUtilizadoVerbaPrazoMed: "",
									valUtilizadoComissaoBrinde: "",
									valTotalExcedenteAmostra: "",
									valUtilizadoVerbaAmostra: "",
									valUtilizadoComissaoAmostra: "",
									valTotalExcedenteBonif: "",
									valUtilizadoVerbaBonif: "",
									valUtilizadoComissaoBonif: "",
									codUsr: "",
									tipoUsuario: "",
									verificadoPreposto: "",
									zlsch: "",
									zzPrazoMed: ""
								};

								request1.onsuccess = function() {

									that.setaCompleto(db, "Não");

									MessageBox.show("Inclusão Efetivada com Sucesso!", {
										icon: MessageBox.Icon.SUCCESS,
										title: "Confirmação",
										actions: [MessageBox.Action.OK],
										onClose: function() {
											that.byId("idTopLevelIconTabBar").setSelectedKey("tab3");
											console.log("Dados PrePedido inseridos");
										}
									});
								};

								request1.onerror = function(event) {
									console.log("Dados PrePedido não foram inseridos :" + event.Message);
								};

							} else {

								// TODO: VERIFICAR METODO DE ATUALIZAR O PEDIDO JA CRIADO

								request1 = objPrePedido.put(objBancoPrePedido);

								objBancoPrePedido = {
									nrPedCli: "",
									kunnr: "",
									werks: "",
									codRepres: "",
									tipoPedido: "",
									idStatusPedido: "",
									situacaoPedido: "",
									tabPreco: "",
									completo: "",
									valMinPedido: "",
									dataPedido: "",
									dataImpl: "",
									valComissao: "",
									observacaoPedido: "",
									observacaoAuditoriaPedido: "",
									existeEntradaPedido: "",
									percEntradaPedido: "",
									valorEntradaPedido: "",
									tipoTransporte: "",
									diasPrimeiraParcela: "",
									quantParcelas: "",
									intervaloParcelas: "",
									tipoNegociacao: "",
									ntgew: "",
									valTotPed: "",
									valDescontoTotal: "",
									valTotalExcedentePrazoMed: "",
									valTotalExcedenteDesconto: "",
									totalItensPedido: "",
									valCampEnxoval: "",
									valCampBrinde: "",
									valCampGlobal: "",
									valVerbaPedido: "",
									valComissaoPedido: "",
									valComissaoUtilizadaDesconto: "",
									valVerbaUtilizadaDesconto: "",
									valUtilizadoComissaoPrazoMed: "",
									valTotalExcedenteNaoDirecionadoDesconto: "",
									valTotalExcedenteNaoDirecionadoPrazoMed: "",
									valTotalAbatidoComissao: "",
									valTotalAbatidoVerba: "",
									valTotalCampGlobal: "",
									valUtilizadoCampBrinde: "",
									valUtilizadoCampGlobal: "",
									valTotalCampEnxoval: "",
									valUtilizadoCampEnxoval: "",
									valTotalCampProdutoAcabado: "",
									valUtilizadoCampProdutoAcabado: "",
									valTotalExcedenteBrinde: "",
									valUtilizadoVerbaBrinde: "",
									valUtilizadoVerbaPrazoMed: "",
									valUtilizadoComissaoBrinde: "",
									valTotalExcedenteAmostra: "",
									valUtilizadoVerbaAmostra: "",
									valUtilizadoComissaoAmostra: "",
									valTotalExcedenteBonif: "",
									valUtilizadoVerbaBonif: "",
									valUtilizadoComissaoBonif: "",
									codUsr: "",
									tipoUsuario: "",
									verificadoPreposto: "",
									zlsch: ""
								};

								request1.onsuccess = function() {
									that.setaCompleto(db, "Não");
									MessageBox.show("Cabeçalho atualizado com Sucesso!", {
										icon: MessageBox.Icon.SUCCESS,
										title: "Concluido!",
										actions: [MessageBox.Action.OK],
										onClose: function() {
											that.byId("idTopLevelIconTabBar").setSelectedKey("tab3");
											console.log("Dados PrePedido Atualizados");
										}
									});
								};

								request1.onerror = function(event) {
									console.log("Dados PrePedido não foram Atualizados :" + event.Message);
								};
							}
						};

						request.onerror = function(e) {
							console.log("Error");
							console.dir(e);
						};
					};
				}
			}
		},

		onResetarCamposPrePedido: function() {
			
			this.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
			this.getOwnerComponent().getModel("modelAux").setProperty("/Kunnr", "");
			this.getOwnerComponent().getModel("modelAux").setProperty("/idFiscalCliente", "");
			
			this.onResetaCamposPrePedido();
		},

		onCancelarPedido: function() {
			var that = this;

			this.onResetarCamposPrePedido();
			that.oItemTemplate = [];

			sap.ui.core.UIComponent.getRouterFor(this).navTo("pedido");
		},

		onBloqueiaPrePedidoTotal: function(habilitado) {

			this.byId("idTabelaPreco").setEnabled(habilitado);
			this.byId("idFormaPagamento").setEnabled(habilitado);
			// this.byId("idTipoTransporte").setEnabled(habilitado);
			this.byId("idTipoPedido").setEnabled(habilitado);
			// this.byId("idTipoNegociacao").setEnabled(habilitado);
			// this.byId("idPrimeiraParcela").setEnabled(habilitado);
			// this.byId("idQuantParcelas").setEnabled(habilitado);
			// this.byId("idIntervaloParcelas").setEnabled(habilitado);
			// this.byId("idValorEntrada").setEnabled(habilitado);
			// this.byId("idPercEntrada").setEnabled(habilitado);
			this.byId("idInserirItem").setEnabled(habilitado);
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

		onBloqueiaPrePedido: function() {
			var that = this;

			var tipoPed = this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/TipoPedido");
			
			for (var i = 0; i < that.objItensPedidoTemplate.length; i++) {
				if (that.objItensPedidoTemplate[i].tipoItem == "Diluicao") {
					this.byId("idDiluirItens").setEnabled(true);
					this.byId("idInserirItemDiluicao").setEnabled(true);
					break;
				} else if (that.objItensPedidoTemplate[i].tipoItem == "Diluido") {
					this.byId("idDiluirItens").setEnabled(false);
					this.byId("idInserirItemDiluicao").setEnabled(false);
					this.byId("idInserirItem").setEnabled(false);
					break;
				}
			}
			
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

			// if (tipoPed == "YTRO") {
			// 	this.byId("idInserirItemDiluicao").setEnabled(false);
			// } else if (tipoPed == "YBON") {
			// 	this.byId("idInserirItemDiluicao").setEnabled(false);
			// }
		},

		// FIM EVENTOS DOS BOTÕES 					

		setaCompleto: function(db, completo) {
			var that = this;
			var objSetaCompletoPedido = [];
			that.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Completo", completo);

			var tx = db.transaction("PrePedidos", "readwrite");
			var objPrePedido = tx.objectStore("PrePedidos");

			var request = objPrePedido.get(that.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli"));

			request.onsuccess = function(e) {
				var result = e.target.result;
				objSetaCompletoPedido = result;
				objSetaCompletoPedido.completo = completo;

				var store1 = db.transaction("PrePedidos", "readwrite");
				var objPedido = store1.objectStore("PrePedidos");
				var request1 = objPedido.put(objSetaCompletoPedido);

				request1.onsuccess = function() {
					console.log("O campo completo foi atualizado para > " + completo);
				};
				request1.onerror = function() {
					console.log("Erro ao abrir o Pedido > " + that.getOwnerComponent().getModel("modelAux").getProperty("/nrPedCli"));
				};
			};
		},

		onValidaComissaoUtilizadaDesconto: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoUtilizadaDesconto", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoUtilizadaDesconto", 0);
			}
		},

		onValidaVerbaUtilizadaPrazoMedio: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0 && valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaPrazoMed", parseFloat(valor));
				oSource.setValueState("None");
				oSource.setValueStateText("");

			} else {
				oSource.setValueState("Error");
				// oSource.setValueStateText("Inserir apenas numeros");
				// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaPrazoMed", 0);

			}
		},

		onValidaComissaoUtilizadaPrazoMedio: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoPrazoMed", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoPrazoMed", 0);
			}
		},

		onValidaComissaoUtilizadaBonif: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBonif", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBonif", 0);
			}
		},

		onValidaVerbaUtilizadaBonif: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBonif", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBonif", 0);
			}
		},

		onValidaVerbaUtilizadaAmostra: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaAmostra", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaAmostra", 0);
			}
		},

		onValidaComissaoUtilizadaAmostra: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoAmostra", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoAmostra", 0);
			}
		},

		onValidaComissaoUtilizadaBrinde: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBrinde", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoComissaoBrinde", 0);
			}
		},

		onValidaVerbaUtilizadaBrinde: function(evt) {
			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValUtilizadoVerbaBrinde", 0);
			}
		},

		onValidaNumeroPositivo: function(evt) {

			var oSource = evt.getSource();

			var valor = oSource.getValue();

			if (valor < 0) {

			}
		},

		onValidaVerbaUtilizadaDesconto: function(evt) {

			var oSource = evt.getSource();
			var valor = oSource.getValue();

			if (valor == "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaUtilizadaDesconto", 0);
			} else if (valor >= 0) {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaUtilizadaDesconto", parseFloat(valor));
			} else if (valor != "") {
				this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaUtilizadaDesconto", 0);
			}
		},

		onSubmitParcela: function() {
			this.byId("idQuantParcelas").focus();
		},

		onSubmitParcela2: function() {
			this.byId("idIntervaloParcelas").focus();
		},

		onFormatterzzVprodDesc: function(value) {
			return parseFloat(Math.round(value * 100) / 100);
		},

		//Passa o item corrente a ser adicionado
		onConsumirSaldoAmostra: function(db, itemPedido, resII, rejII, iQtde) {
			var that = this;

			var codUsuario = this.getOwnerComponent().getModel("modelAux").getProperty("/CodUsr");

			var store = db.transaction("ControleAmostra", "readwrite");
			var objControleAmostras = store.objectStore("ControleAmostra");

			var requestMaterial = objControleAmostras.get(0);

			requestMaterial.onsuccess = function(e) {
				var oSaldo = e.target.result;

				if (oSaldo == undefined) {

					//COLOCAR TUDO QUE O KRA DIGITOU COMO EXCEDENTE. 
					itemPedido.zzQntAmostra = itemPedido.zzQnt;
					resII();
					// MessageBox.show("Não possui saldo de Amostra!", {
					// 	icon: MessageBox.Icon.ERROR,
					// 	title: "Saldo Indisponível!",
					// 	actions: [MessageBox.Action.OK],
					// });

				} else {

					var pSaldo = new Promise(function(res4) {
						/* Recupero o saldo de amostras */
						var oAmostras = [];

						that.onGetSaldoAmostra(oAmostras, res4, itemPedido);

					}).then(function(oAmostras) {
						// Total de amostras já digitadas considerando o item atual.
						var dValorTotAmo = iQtde + oAmostras.qtde;

						// Saldo do representante menos o total de amostras já digitadas
						var saldoRestante = oSaldo.quantidadeTotal - oAmostras.qtde;

						if (dValorTotAmo > parseInt(oSaldo.quantidadeTotal, 10)) {
							var excedenteAmostra = (saldoRestante < 0 ? iQtde : iQtde - saldoRestante);

							// MessageBox.show("Não possui saldo de Amostra! (Saldo: " + saldoRestante + ")", {
							// 	icon: MessageBox.Icon.ERROR,
							// 	title: "Saldo Indisponível!",
							// 	actions: [MessageBox.Action.OK],
							// });
							itemPedido.zzQntAmostra = excedenteAmostra;

							//Grava a quantidade de saldo excedente de amsotra .. pra gerar dos brindes.

							resII();
							// rejII();
						} else {

							itemPedido.zzQntAmostra = 0;

							resII();
						}
					});
				}
			};
		},

		onGetSaldoAmostra: function(oAmostras, res4, itemPedido) {

			var that = this;
			var open = indexedDB.open("VB_DataBase");
			var db = "";

			// Recupero todas os documentos pendentes, inclusive o que está sendo digitado /
			var p1 = new Promise(function(res, rej) {

				open.onsuccess = function() {
					db = open.result;

					var sPedidos = db.transaction("PrePedidos", "readwrite");
					var objPedidos = sPedidos.objectStore("PrePedidos");
					var iStatus = objPedidos.index("idStatusPedido");

					/*
					Regra dos status dos pedidos
					1 - Pedidos em digitação: Considerar todos.
					2 - Pedidos pendentes de envio: Considerar todos.
					3 - Pedidos enviados: Considerar todos os pedidos 
					enviados DEPOIS DA ÚLTIMA ATUALIZAÇÃO.(Os pedidos
					enviados antes da última atualização já estarão
					sendo considerados no saldo retornado da atualização
					de tabelas).
					*/

					/* Recupero todos os pedidos com status 1, 2, 3 */
					var krStatus = IDBKeyRange.bound(1, 3);
					var tPedido = iStatus.openCursor(krStatus);
					var oDocsPendentes = [];
					var cursor;
					var oDoc;
					tPedido.onsuccess = function(e) {
						cursor = e.target.result;

						if (cursor) {
							oDoc = cursor.value;

							// Verifico se o pedido já foi enviado (Status = 3) /
							if (oDoc.idStatusPedido == 3) {

								// Recupero a data da última atualização de tabelas /
								/**/
								var sUltimaAtualizacao = that.getOwnerComponent().getModel("modelAux").getProperty("/DataAtualizacao");
								sUltimaAtualizacao = sUltimaAtualizacao.replace("/", "-").replace("/", "-").replace(":", "-").replace(" ", "").replace(" ", "") + "-00";
								var p = sUltimaAtualizacao.split("-");
								var dUltimaAtualizacao = new Date("20" + p[2], parseInt(p[1]) - 1, p[0], p[3], p[4], p[5]);

								var sDataImpl = oDoc.dataImpl.replace("/", "-").replace("/", "-").replace(":", "-").replace(":", "-").replace(" ", "").replace(" ", "") + "-00";
								p = sDataImpl.split("-");
								var dDataImpl = new Date(p[2], parseInt(p[1]) - 1, p[0], p[3], p[4], p[5]);
								/**/

								// Verifico se a data do pedido é superior a data da última atualização /
								if (dDataImpl > dUltimaAtualizacao) {
									oDocsPendentes.push(oDoc);
								}

								cursor.continue();

							} else {
								cursor.continue();

								oDocsPendentes.push(oDoc);
							}
						} else {
							res(oDocsPendentes);
						}
					};
				};
			});

			// Recupero todos os itens do tipo YAMO => AMOSTRA  /
			p1.then(function(oDocsPendentes) {

				var vItensAmostras = [];

				var p2 = new Promise(function(res2) {
					var iIteracao = 0;

					// Percorro todos os pedidos buscando os itens do tipo amostras em aberto /
					for (var i = 0; i < oDocsPendentes.length; i++) {

						var sItens = db.transaction("ItensPedido", "readwrite");
						var objItens = sItens.objectStore("ItensPedido");
						var inrPedCli = objItens.index("nrPedCli");

						var p3 = new Promise(function(res3, rej3) {
							var tItens = inrPedCli.openCursor(oDocsPendentes[i].nrPedCli);
							var tempItensBon = [];

							tItens.onsuccess = function(e) {
								var cursor = e.target.result;

								if (cursor) {

									/* Verifico se o item em questão é de Amostras (YAMO)*/
									if (cursor.value.mtpos === "YAMO") {
										tempItensBon.push(cursor.value);
									}

									cursor.continue();
								} else {

									res3(tempItensBon);
								}
							};
						}).then(function(tempItensBon) { /*res3*/
							iIteracao = iIteracao + 1;

							for (var j = 0; j < tempItensBon.length; j++) {
								// Verifico se não é o pedido e o material em questão, não posso considerar para cálculo de saldo /
								if (tempItensBon[j].idItemPedido == itemPedido.idItemPedido && tempItensBon[j].index == itemPedido.index) {
									continue;
								}

								vItensAmostras.push(tempItensBon[j]);
							}

							// Verifico se é a últma iteração do loop pra dar continuidade ao processo /
							if (iIteracao == oDocsPendentes.length) {
								res2(vItensAmostras);
							}
						});

					} /* for */

				}).then(function(vItensAmostras) {
					var iQtdeUtilizada = 0;
					for (var i = 0; i < vItensAmostras.length; i++) {
						iQtdeUtilizada = iQtdeUtilizada + vItensAmostras[i].zzQnt;
					}

					oAmostras.itens = vItensAmostras;
					oAmostras.qtde = iQtdeUtilizada;

					res4(oAmostras);
				});
			});
		},
		/* onGetSaldoAmostra */

		/* Campanha Global Primeiro método */
		//Esse metodo carrega todas as informações da campanha global e inseri no item para ser usado depois.
		onValidarItensCampanhaGlobal: function(db, ItemPedido, resolveTopo, rejectTopo) {
			var that = this;
			var proximoItemDiferente = false;
			var vetorItemAux = [];

			new Promise(function(resolve, reject) {
				/* Busca o grupo da camp global do item selecionado */
				that.onBuscaGrupoCmpGlobal(db, ItemPedido, resolve, reject);
				
			}).then(function() {
				
				//Variavel pra identificar se o item participa da campanha Global. (Não e Sim)
				ItemPedido.zzUtilCampGlobal = "Não";
				
				//Verifica a quantidade de itens que tem que ser vendidos para entrar na campanha
				that.onVerifQuantCmpGlobal(db, ItemPedido, resolveTopo, rejectTopo);

			}).catch(function(Matnr) {
				/* Não achou grupo do material para campanha Global */
				ItemPedido.zzQntRegraGb = 0;
				ItemPedido.zzGrupoGlobal = 0;
				
				//Variavel pra identificar se o item participa da campanha Global. (Não e Sim)
				ItemPedido.zzUtilCampGlobal = "Não";
				
				console.log("Matnr: " + Matnr + " não possui Grupo Cmp Global.");
				rejectTopo();
			});
		},
		/* Fim Campanha Global Primeiro método */
		
		//Busca em qual grupo da campanha Global o item pertence.
		onBuscaGrupoCmpGlobal: function(db, ItemPedido, resolve, reject) {

			//Verifica se o item item grupo de Campanha Global para ser Agrupado. Senão tiver zzGrupoGlobal = 0;
			var transaction = db.transaction("CmpGbGrpProdsAcabs", "readonly");
			var objectStoreMaterial = transaction.objectStore("CmpGbGrpProdsAcabs");

			var indexMatnr = objectStoreMaterial.index("material");

			var request = indexMatnr.get(ItemPedido.matnr);

			request.onsuccess = function(event) {

				var result = event.target.result;

				if (result != undefined && result != null) {

					console.log("Matnr: " + result.material + ", Grupo: " + result.grupo);
					ItemPedido.zzGrupoGlobal = result.grupo;
					resolve(ItemPedido);
					
				} else {
					//Se não achar o item cadastrado na camp global, setar o id do grupo e a quantidade de range como 0.
					//no catch da promise
					reject(ItemPedido.matnr);

				}
			};
		},

		//Quantidade que este grupo deve vender na Camp Global.
		onVerifQuantCmpGlobal: function(db, ItemPedido, resolveTopo, rejectTopo) {
			
			var transaction = db.transaction("CmpGbProdsAcabs", "readonly");
			var objectStore = transaction.objectStore("CmpGbProdsAcabs");
			var indexGrupo = objectStore.index("grupo");

			var request = indexGrupo.get(ItemPedido.zzGrupoGlobal);

			request.onsuccess = function(event) {

				var result = event.target.result;

				if (result != undefined && result != null) {

					//zzQntRegraGb vai ser a variavel para identificar a quantidade que o kra tem que comprar 
					//pra ativar a bonificação
					console.log("Material: " + ItemPedido.matnr + ", Qtd: " + parseFloat(result.quantidade));
					ItemPedido.zzQntRegraGb = parseFloat(result.quantidade);
					resolveTopo();

				} else {

					// Quando não tem range para ativar campanha. (Quantidade necessaria para ativar Campanha Global)
					MessageBox.show("Falta o cadastro na tabela de ranges para o material " + ItemPedido.matnr + " para utilizar na campanha Global.", {
						icon: MessageBox.Icon.ERROR,
						title: "Entre em contato com a TI da VB!",
						actions: [MessageBox.Action.OK]
					});
					//Se o valor estiver zerado ou pq não tem cadastro realizado pra este produto ou não faz parte da regra de campanha.
					ItemPedido.zzQntRegraGb = 0;
					rejectTopo();
				}
			};
		},
		
		//Agrupa os itens da campanha pelo grupo e verifica se atingiu a regra para ver a quantidade de bonificação
		// que o kra pode inserir com o Brinde.
		onAgrupaItensGlobal: function(res, rej, that) {
			var proximoItemDiferente = false;
			var vetorGrpFamilia = [];
			var vetorAuxItensPedido = [];
			var retorno = "";
			
			if(that.objItensPedidoTemplate.length == 1 && that.objItensPedidoTemplate[0].mtpos == "YBRI"){
				res();
			}
			
			for (var i = 0; i<that.objItensPedidoTemplate.length; i++) {
				var aux = [];
				
				if(that.objItensPedidoTemplate[i].mtpos != "YBRI" && that.objItensPedidoTemplate[i].mtpos != "YAMO"){
					aux = that.objItensPedidoTemplate[i];
					vetorAuxItensPedido.push(aux);
				}
			}
			
			//Ordenando para desconto Familia normal. Utiliza vetor global de itens (objItensPedidoTemplate).
			vetorAuxItensPedido.sort(function(a, b) {
				return a.zzGrupoGlobal - b.zzGrupoGlobal;
			});
			
			/*Percorre os itens já inseridos e identica se atingiu a quantidade do grupo da Camp global */
			for (var i = 0; i<vetorAuxItensPedido.length; i++) {
				
				if (proximoItemDiferente == true) {
					proximoItemDiferente = false;
					vetorGrpFamilia = [];
				}
				
				if (vetorGrpFamilia.length == 0 && vetorAuxItensPedido.length == 1 && vetorAuxItensPedido[i].tipoItem != "Diluido") {
					
					//o vetor de itens tem um unico item. nesse caso já tenho que verificar 
					//se já atingiu a quantidade para utilizar os brindes.
					
					vetorGrpFamilia.push(vetorAuxItensPedido[i]);
					retorno = that.onCheckQuantidadeGlobal(vetorGrpFamilia, that);
					
				} else if (vetorAuxItensPedido.length > 1 && (i + 1) < vetorAuxItensPedido.length && vetorAuxItensPedido[i].tipoItem != "Diluido") {
					
					if (vetorAuxItensPedido[i].zzGrupoGlobal == vetorAuxItensPedido[i + 1].zzGrupoGlobal) {
						
						proximoItemDiferente = false;
						vetorGrpFamilia.push(vetorAuxItensPedido[i]);
						
					} else {
						//Nesse momento tenho os itens da mesma familia.. tendo os itens da familia .. somar as quantidades
						vetorGrpFamilia.push(vetorAuxItensPedido[i]);
						retorno = that.onCheckQuantidadeGlobal(vetorGrpFamilia, that);
						proximoItemDiferente = true;
					}
					
				} else if ((i + 1) == vetorAuxItensPedido.length && vetorAuxItensPedido[i].tipoItem != "Diluido") {
					
					//sinal proximoItemDiferente = true e limpou
					if (vetorGrpFamilia.length > 0) {
						
						vetorGrpFamilia.push(vetorAuxItensPedido[i]);
						retorno = that.onCheckQuantidadeGlobal(vetorGrpFamilia, that);
						
					} else {
						//ultimo item e é diferente do antepenultimo
						vetorGrpFamilia.push(vetorAuxItensPedido[i]);
						retorno = that.onCheckQuantidadeGlobal(vetorGrpFamilia, that);
					}
				}
			}
			
			if(retorno == "OK"){
				res();
			}else {
				rej();
			}
		},
		
		//Verifica quantas vezes vai poder utilizar o range dos brindes, Rotina executada antes da inserção do item no total dos itens.
		onCheckQuantidadeGlobal: function(vetorGrpFamilia, that){
			// var that = this;
			var qntItens = 0;
			var valorRange = 0;
			var zzGrupoGlobal = "";
			//variável que grava quantas vezes o kra pode usar o range de brindes.
			//Ex: se o range a ser atingido for 20 itens para usar os brindes e a quantidade digita do produto for 40.
			// essa variavel irá armazenar 2. (Quantidade atingida a ser utilizada).
			var qntParaUtilizar = 0;
			
			for(var i=0; i<vetorGrpFamilia.length; i++){
				
				qntItens += vetorGrpFamilia[i].zzQnt;
				valorRange = vetorGrpFamilia[i].zzQntRegraGb;
				zzGrupoGlobal = vetorGrpFamilia[i].zzGrupoGlobal;
				
			}
			
			if(qntItens >= valorRange && valorRange > 0){
				
				qntParaUtilizar = parseInt(qntItens/valorRange, 10);
				
			} else {
				
				qntParaUtilizar = 0;
			}
				
			for(i=0; i<vetorGrpFamilia.length; i++){
				for(var j=0; j<that.objItensPedidoTemplate.length; j++){
					if(vetorGrpFamilia[i].matnr == that.objItensPedidoTemplate[j].matnr){
						that.objItensPedidoTemplate[j].zzAtingiuCmpGlobal = qntParaUtilizar;
					}
				}
			}
			
			console.log("O grupo " + zzGrupoGlobal + " teve " + qntItens + " itens e pode utilizar " + qntParaUtilizar + "x os brindes.");
			return "OK";
		},
		
		//Vetor por grupo de campanha global
		onValidaItensCampGlobal: function(vetorGrpFamilia, that){
			// var that = this;
			var vetorBrindesGlobais = [];
			var totalItens = 0;
			var totalItensBrinde = 0;
			var resultQuant = 0;
			var valorRangeProd = 0;
			var valorRangeBrinde = 0;
			var mensagemCmpGlobal = "";
			
			for(var j=0; j<vetorGrpFamilia.length; j++){
				if(vetorGrpFamilia[j].mtpos == "YBRI" && vetorGrpFamilia[j].zzGrupoGlobal != 0){
					vetorBrindesGlobais.push(vetorGrpFamilia[j]);
				} else if(vetorGrpFamilia[j].mtpos != "YBRI"  && vetorGrpFamilia[j].mtpos != "YAMO" && vetorGrpFamilia[j].zzGrupoGlobal != 0){
					totalItens += vetorGrpFamilia[j].zzQnt;
					valorRangeProd = vetorGrpFamilia[j].zzQntRegraGb;
				}
			}
			
			if(totalItens >= valorRangeProd && valorRangeProd > 0){
				//Variavel que mostra quantos brindes foram atingidos.
				resultQuant = parseInt(totalItens / valorRangeProd, 10);
				
			} else {
				
				resultQuant = 0;
			}
				
			for(var i=0; i<vetorBrindesGlobais.length; i++){
				
				totalItensBrinde += vetorBrindesGlobais[i].zzQnt;
				valorRangeBrinde = vetorBrindesGlobais[i].zzQntRegraGb;
			}
			
			var totalPermitidoBrinde = valorRangeBrinde * resultQuant;
			
			if(totalItensBrinde > totalPermitidoBrinde){
				console.log("Ultrapassou limite de brindes permitidos da Campanha Global");
				
				mensagemCmpGlobal = "Quantidade de itens permitidos para inserir de acordo com o range atingido: " + totalPermitidoBrinde + ". Quantidade de itens já inseridos: " + totalItensBrinde;
				return mensagemCmpGlobal;
				
			} else{
				
				return "OK";
			}
		},
		
		onAgrupaValidaItensCampGlobal: function(res, rej, that) {
			var proximoItemDiferente = false;
			var vetorGrpFamilia = [];
			var vetorAuxItensPedido = [];
			var retorno = "";
			
			if(that.objItensPedidoTemplate.length == 1 && that.objItensPedidoTemplate[0].mtpos == "YBRI"){
				res();
			}
			
			for (var i = 0; i<that.objItensPedidoTemplate.length; i++) {
					var aux = [];
					aux = that.objItensPedidoTemplate[i];
					vetorAuxItensPedido.push(aux);
			}
			
			//Ordenando para desconto Familia normal. Utiliza vetor global de itens (objItensPedidoTemplate).
			vetorAuxItensPedido.sort(function(a, b) {
				return a.zzGrupoGlobal - b.zzGrupoGlobal;
			});
			
			/*Percorre os itens já inseridos e identica se atingiu a quantidade do grupo da Camp global */
			for (var i = 0; i<vetorAuxItensPedido.length; i++) {
				
				if (proximoItemDiferente == true) {
					proximoItemDiferente = false;
					vetorGrpFamilia = [];
				}
				
				if (vetorGrpFamilia.length == 0 && vetorAuxItensPedido.length == 1 && vetorAuxItensPedido[i].tipoItem != "Diluido") {
					
					//o vetor de itens tem um unico item. nesse caso já tenho que verificar 
					//se já atingiu a quantidade para utilizar os brindes.
					
					vetorGrpFamilia.push(vetorAuxItensPedido[i]);
					retorno = that.onValidaItensCampGlobal(vetorGrpFamilia, that);
					
				} else if (vetorAuxItensPedido.length > 1 && (i + 1) < vetorAuxItensPedido.length && vetorAuxItensPedido[i].tipoItem != "Diluido") {
					
					if (vetorAuxItensPedido[i].zzGrupoGlobal == vetorAuxItensPedido[i + 1].zzGrupoGlobal) {
						
						proximoItemDiferente = false;
						vetorGrpFamilia.push(vetorAuxItensPedido[i]);
						
					} else {
						//Nesse momento tenho os itens da mesma familia.. tendo os itens da familia .. somar as quantidades
						vetorGrpFamilia.push(vetorAuxItensPedido[i]);
						retorno = that.onValidaItensCampGlobal(vetorGrpFamilia, that);
						proximoItemDiferente = true;
					}
					
				} else if ((i + 1) == vetorAuxItensPedido.length && vetorAuxItensPedido[i].tipoItem != "Diluido") {
					
					//sinal proximoItemDiferente = true e limpou
					if (vetorGrpFamilia.length > 0) {
						
						vetorGrpFamilia.push(vetorAuxItensPedido[i]);
						retorno = that.onValidaItensCampGlobal(vetorGrpFamilia, that);
						
					} else {
						//ultimo item e é diferente do antepenultimo
						vetorGrpFamilia.push(vetorAuxItensPedido[i]);
						retorno = that.onValidaItensCampGlobal(vetorGrpFamilia, that);
					}
				}
			}
			
			if(retorno == "OK"){
				res();
			}else {
				rej();
			}
		},
	});
});