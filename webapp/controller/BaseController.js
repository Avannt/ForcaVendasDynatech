/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"
], function(Controller, History, UIComponent) {
	"use strict";

	return Controller.extend("testeui5.controller.BaseController", {
		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

			var oModel = new sap.ui.model.json.JSONModel({
				kunnr: "",
				land1: "",
				name1: "",
				name2: "",
				ort01: "",
				ort02: "",
				regio: "",
				stras: "",
				pstlz: "",
				stcd1: "",
				stcd2: "",
				inco1: "",
				parvw: "",
				lifnr: ""
			});

			this.getOwnerComponent().setModel(oModel, "modelCliente");

			oModel = new sap.ui.model.json.JSONModel({
				estabelecimentoDadosPedido: 0,
				estadoEstabelDadosPedido: "",
				tipoDadosPedido: "",
				vencimento1DadosPedido: 0,
				vencimento2DadosPedido: 0,
				vencimento3DadosPedido: 0,
				indiceDadosPedido: 0,
				dataLimiteFaturamentoDadosPedido: "",
				dataEntregaDadosPedido: "",
				pedidoOrigemClienteDadosPedido: "",
				localEntregaDadosPedido: "",
				mensagem1DadosPedido: "",
				mensagem2DadosPedido: "",
				mensagem3DadosPedido: "",
				observacoesDadosPedido: "",
				numeroDadosPedido: 0,
				idSituacaoDadosPedido: "",
				situacaoDadosPedido: "",
				tabelaPrecoDadosPedido: 0,
				tipoTransporteDadosPedido: "",
				dataDadosPedido: "",
				valorMinimoDadosPedido: 0,
				ValPctDescontoCanalDadosPedido: 0,
				PercAcrescDadosPedido: 0,
				PercReducDadosPedido: 0,
				PercFatorDadosPedido: 0,
				PercContratoDadosPedido: 0,
				ValCustoFixoDadosPedido: 0,
				ValCpmfDadosPedido: 0,
				ValIrDadosPedido: 0,
				ValFreteDadosPedido: 0,
				ValComissaoDadosPedido: 0,
				ValContratoDadosPedido: 0,
				ValLucroDadosPedido: 0,
				PercIcmsDadosPedido: 0,
				PercPisDadosPedido: 0,
				PercCofinsDadosPedido: 0,
				PercCpmfDadosPedido: 0,
				PercIrDadosPedido: 0,
				PercFreteDadosPedido: 0,
				PercComissaoDadosPedido: 0,
				ValRoyaltiesDadosPedido: 0,
				PercRoyaltiesDadosPedido: 0,
				PercGanhoDadosPedido: 0,
				ValGanhoDadosPedido: 0,
				ValPrecoBaseDadosPedido: 0,
				PercPromoDadosPedido: 0,
				ValPromocaoDadosPedido: 0,
				PercCustoFixoDadosPedido: 0,
				PercLucroDadosPedido: 0,
				ValIcmsDadosPedido: 0,
				ValFinsocialDadosPedido: 0,
				ValPisDadosPedido: 0,
				PercRedIcmDadosPedido: 0,
				NrMesinaDadosPedido: 0,
				PercIncentDadosPedido: 0,
				DataVigenciaInscSTCliente: "",
				IdBaseDadosPedido: "",
				CodEmpresaDadosPedido: "",
				LogItUnidNegocDadosPedido: "",
				PercRentNegDadosPedido: 0,
				LogVerbaRentNegDadosPedido: "",
				NrPedCliDTS: "",
				Completo: "",
				CodMotivDescCamp: "",
				ValDescCampInform: "",
				TipoIntegrBol: ""
			});
			this.getOwnerComponent().setModel(oModel, "modelDadosPedido");

			oModel = new sap.ui.model.json.JSONModel({
				descontoAplicar: "",
				descontoDisponivel: "",
				idDesconto: "",
				descontoAplicarCampanha: "",
				descontoDisponivelCamp: "",
				idDescontoCamp: "",
				descontoAplicarBoleto: "",
				idDescontoBoleto: "",
				TipoIntegrBol: ""
			});

			this.getOwnerComponent().setModel(oModel, "modelDescontos");

			oModel = new sap.ui.model.json.JSONModel({
				totalPedido: "",
				totalLiquidoPedido: "",
				totalLiquidoPedidoCamp: "",
				totalComSTPedido: "",
				totalItens: "",
				pesoBruto: "",
				pesoLiquido: "",
				verbaGasta: "",
				rentabilidadeTotal: ""
			});

			this.getOwnerComponent().setModel(oModel, "modelTotalPedido");

			oModel = new sap.ui.model.json.JSONModel({
				numeroItemItensPedido: 0,
				nomeClienteItensPedido: "",
				numeroPedidoItensPedido: "",
				codigoClienteItensPedido: 0,
				codigoItemItensPedido: 0,
				unidadeMedidaItensPedido: "",
				descricaoItemItensPedido: "",
				unidadeNegItensPedido: "",
				contratoDescontoItensPedido: "",
				valorCustoItensPedido: 0,
				canalItensPedido: 0,
				tabelaCanalItensPedido: 0,
				promocaoItensPedido: 0,
				precoVendaItensPedido: 0,
				verbaGastaItensPedido: 0,
				maxDescontoItens: 0,
				verbaDisponivelItensPedido: 0, //esse kra armazena a verba de cada item gerado.
				valorMinimoItemItemsPedido: 0,
				quantidadeItensPedido: 0,
				valorTotalItensPedido: 0,
				valorUnitarioItensPedido: 0,
				valorComSTitensPedido: 0,
				valorTotalComSTitensPedido: 0,
				valorUnitarioComSTitensPedido: 0,
				rentabilidadeItensPedido: 0,
				rebaixaItensPedido: 0,
				substituicaoTributariaItensPedido: "",
				quantidadeUltimaCompraItensPedido: 0,
				dataUltimaCompraItensPedido: "",
				valorUltimaCompraItensPedido: 0
			});

			this.getOwnerComponent().setModel(oModel, "modelItensPedido");

			var oModelAux = new sap.ui.model.json.JSONModel({
				CodRepres: "",
				Imei: "",
				Werks: "",
				VersaoApp: "",
				DataAtualizacao: "",
				Kunnr: ""
			});

			this.getOwnerComponent().setModel(oModelAux, "modelAux");

			oModel = new sap.ui.model.json.JSONModel({
				vencimento1: "",
				vencimento2: "",
				vencimento3: "",
				indice: "",
				estabelecimento: "",
				tabelaPreco: "",
				cliente: "",
				canal: "",
				exibicao: "",
				origEstabel: "",
				origCliente: "",
				substTributaria: "",
				statusCredito: "",
				contrato: ""
			});

			this.getOwnerComponent().setModel(oModel, "modelRelatorioTabela");
		},

		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNavBack: function(oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("NotFoun", {}, true);
			}
		},

		mErro: function() {

		},

		mSuc: function(sErro, sTempTitulo) {
			var sTitulo = sTempTitulo;
			
			sap.m.MessageBox.show(sErro, {
				icon: sap.m.MessageBox.Icon.SUCCESS,
				title: sTitulo,
				actions: ["Sim", "Cancelar"]
			});
		}
	});
});