/*eslint-disable no-console, no-alert */
/*eslint-disable no-console, sap-no-hardcoded-url */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"testeui5/controller/BaseController",
		"sap/m/MessageBox",
		"testeui5/util/mensagem",
		"testeui5/js/index"
	],
	function(Controller, BaseController, MessageBox, mensagem, index) {
		"use strict";
		var idbSupported = false;
		var ImeiResult = []; 
		
		return BaseController.extend("testeui5.controller.Login", {

			onInit: function() {
				this.getRouter().getRoute("login").attachPatternMatched(this._onLoadFields, this);
			},

			_onLoadFields: function() {
				var that = this;

				this.onInicializaModels();

				// this.getView().setModel(oModel2, "VBModel");
				/* 
				Alterar aqui o ambiente:
				PRD => ReleasePRD = TRUE
				QAS => ReleasePRD = FALSE
				*/
				this.getOwnerComponent().getModel("modelAux").setProperty("/ReleasePRD", false);

				var sUrl;
				//Versão App
				if (this.getOwnerComponent().getModel("modelAux").getProperty("/ReleasePRD")) {
					this.getOwnerComponent().getModel("modelAux").setProperty("/VersaoApp", "1.0.37");
					sUrl = "http://104.208.137.3:8000/sap/opu/odata/sap/ZFORCA_VENDAS_VB_SRV/";

					var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
						json: true,
						user: "appadmin",
						password: "sap123"
					});

					this.getView().setModel(oModel);
					this.getOwnerComponent().getModel("modelAux").setProperty("/DBModel", oModel);
				} else { // QAS
					this.getOwnerComponent().getModel("modelAux").setProperty("/DBModel", this.getView().getModel());
					this.getOwnerComponent().getModel("modelAux").setProperty("/VersaoApp", "1.0.19");
				}

				this.getOwnerComponent().getModel("modelAux").setProperty("/Werks", "1000");
				this.getOwnerComponent().getModel("modelAux").setProperty("/EditarIndexItem", 0);

				this.getOwnerComponent().getModel("modelAux").setProperty("/bConectado", false);

				//sap.ui.getCore().byId("label").visible = false;

				if ("indexedDB" in window) {
					idbSupported = true;
				}

				if (idbSupported) {

					var open = indexedDB.open("VB_DataBase", 49);

					// Create the Tables
					open.onupgradeneeded = function(e) {
						var db = e.target.result;
						console.log(e);

						if (!db.objectStoreNames.contains("Usuarios")) {
							var objUser = db.createObjectStore("Usuarios", {
								keyPath: "werks",
								unique: true
							});
							objUser.createIndex("codRepres", "codRepres", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE CLIENTES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("Clientes")) {
							var objCliente = db.createObjectStore("Clientes", {
								keyPath: "kunnr",
								unique: true
							});
							objCliente.createIndex("werks", "werks", {
								unique: false
							});
						}

						if (!db.objectStoreNames.contains("TiposPedidos")) {
							var objTiposPedidos = db.createObjectStore("TiposPedidos", {
								keyPath: "idTipoPedido",
								unique: true
							});
						}

						if (!db.objectStoreNames.contains("TitulosAbertos")) {
							var objTituloAberto = db.createObjectStore("TitulosAbertos", {
								autoIncrement: true,
								keyPath: "idTituloAberto",
								unique: true
							});

							objTituloAberto.createIndex("kunnr", "kunnr", {
								unique: false
							});
						}

						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE (ZSDMF_MATERIAIS)  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("Materiais")) {
							var objMateriais = db.createObjectStore("Materiais", {
								keyPath: "matnr",
								unique: true
							});

							objMateriais.createIndex("mtpos", "mtpos", {
								unique: false
							});
						}

						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE PV ENTREGA FUTURA  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("EntregaFutura")) {
							var objEntregaFutura = db.createObjectStore("EntregaFutura", {
								keyPath: "idEntregaFutura",
								unique: true
							});

							objEntregaFutura.createIndex("Vbeln", "Vbeln", {
								unique: false
							});

							objEntregaFutura.createIndex("Kunrg", "Kunrg", {
								unique: false
							});

						}

						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE PV ENTREGA FUTURA (RETORNO) >>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("EntregaFutura2")) {
							var objEntregaFutura2 = db.createObjectStore("EntregaFutura2", {
								keyPath: "idEntregaFutura",
								unique: true
							});

							objEntregaFutura2.createIndex("Vbeln", "Vbeln", {
								unique: false
							});

							objEntregaFutura2.createIndex("Kunrg", "Kunrg", {
								unique: false
							});
						}

						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE PV ENTREGA FUTURA (HISTÓRICO) >>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("EntregaFutura3")) {
							var objEntregaFutura3 = db.createObjectStore("EntregaFutura3", {
								keyPath: "idEntregaFutura",
								unique: true
							});

							objEntregaFutura3.createIndex("Vbeln", "Vbeln", {
								unique: false
							});

							objEntregaFutura3.createIndex("Kunrg", "Kunrg", {
								unique: false
							});
						}

						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE PEDIDOS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("PrePedidos")) {
							var objPedido = db.createObjectStore("PrePedidos", {
								keyPath: "nrPedCli",
								unique: true
							});
							objPedido.createIndex("kunnr", "kunnr", {
								unique: false
							});
							objPedido.createIndex("werks", "werks", {
								unique: false
							});
							objPedido.createIndex("idStatusPedido", "idStatusPedido", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE ITENSPEDIDO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("ItensPedido")) {
							var objItensPedido = db.createObjectStore("ItensPedido", {
								keyPath: "idItemPedido",
								unique: true
							});
							objItensPedido.createIndex("nrPedCli", "nrPedCli", {
								unique: false
							});
							//Chave composta
							// objItensPedido.createIndex("idStatusPed",
							//     {keyPath: ["nrPedcli", "idStatusPedido"]}
							// );
							objItensPedido.createIndex("matnr", "matnr", {
								unique: false
							});
							objItensPedido.createIndex("mtpos", "mtpos", {
								unique: false
							});
							objItensPedido.createIndex("werks", "werks", {
								unique: false
							});
						}

						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE STATUS PEDIDO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("StatusPedidos")) {
							var objStatusPedidos = db.createObjectStore("StatusPedidos", {
								keyPath: "Nrpedcli",
								unique: true
							});
							objStatusPedidos.createIndex("Kunnr", "Kunnr", {
								unique: false
							});
							objStatusPedidos.createIndex("Werks", "Werks", {
								unique: false
							});
							objStatusPedidos.createIndex("idStatusPedido", "idStatusPedido", {
								unique: false
							});
						}

						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE ACOMP PEDIDO TOPO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
						if (!db.objectStoreNames.contains("AcompPedidoTopo")) {
							var objAcompPedidosTopo = db.createObjectStore("AcompPedidoTopo", {
								keyPath: "Nrpedcli",
								unique: true
							});
							objAcompPedidosTopo.createIndex("Kunnr", "Kunnr", {
								unique: false
							});
							objAcompPedidosTopo.createIndex("Werks", "Werks", {
								unique: false
							});
							objAcompPedidosTopo.createIndex("idStatusPedido", "idStatusPedido", {
								unique: false
							});
						}
						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE ACOMP PEDIDO DET >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
						if (!db.objectStoreNames.contains("AcompPedidoDetalhe")) {
							var objAcompPedidosDet = db.createObjectStore("AcompPedidoDetalhe", {
								keyPath: "idItemPedido",
								unique: true
							});
							objAcompPedidosDet.createIndex("nrPedCli", "nrPedCli", {
								unique: false
							});
							objAcompPedidosDet.createIndex("matnr", "matnr", {
								unique: false
							});
							objAcompPedidosDet.createIndex("mtpos", "mtpos", {
								unique: false
							});
							objAcompPedidosDet.createIndex("werks", "werks", {
								unique: false
							});
						}
						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE SALDO VERBA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
						if (!db.objectStoreNames.contains("SaldoVerba")) {
							var objSaldoVerba = db.createObjectStore("SaldoVerba", {
								keyPath: "Reprs",
								unique: true
							});
							objSaldoVerba.createIndex("Kunnr", "Kunnr", {
								unique: false
							});
							objSaldoVerba.createIndex("Werks", "Werks", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. ITEM TABELA A960 (ZSDMF_A960) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A959 – Esta tabela servirá para vincular o código de cliente com a tabela de preço
						if (!db.objectStoreNames.contains("A959")) {
							var objA959 = db.createObjectStore("A959", {
								keyPath: "idA959",
								unique: true
							});
						}

						if (!db.objectStoreNames.contains("A960")) {
							var objA960 = db.createObjectStore("A960", {
								keyPath: "idA960",
								unique: true
							});
							objA960.createIndex("kunnr", "kunnr", {
								unique: false
							});
							objA960.createIndex("pltyp", "pltyp", {
								unique: false
							});
							objA960.createIndex("werks", "werks", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. ITEM TABELA A961 (ZSDMF_A961) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A961 – Esta tabela servirá para vincular o código de cliente com a tabela de preço
						if (!db.objectStoreNames.contains("A961")) {
							var objClienteTabPreco = db.createObjectStore("A961", {
								keyPath: "idA961", // Werks.kunnr.pltyp
								unique: true
							});
							objClienteTabPreco.createIndex("kunnr", "kunnr", {
								unique: false
							});
							objClienteTabPreco.createIndex("pltyp", "pltyp", {
								unique: false
							});
							objClienteTabPreco.createIndex("werks", "werks", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..TABELA A962 (ZSDMF_A962) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A962 – Esta tabela será para cadastrar as famílias referente ao desconto extra
						if (!db.objectStoreNames.contains("A962")) {
							var objA962 = db.createObjectStore("A962", {
								keyPath: "idA962",
								unique: true
							});
							objA962.createIndex("werks", "werks", {
								unique: false
							});
						}

						// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE A963 (ZSDMF_A963) >>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A963 – Esta tabela fará o vínculo do representante e a tabela de preços
						if (!db.objectStoreNames.contains("A963")) {
							var objA963 = db.createObjectStore("A963", {
								keyPath: "idA963",
								unique: true
							});
							objA963.createIndex("werks", "werks", {
								unique: false
							});
							objA963.createIndex("lifnr", "lifnr", {
								unique: false
							});
							objA963.createIndex("pltyp", "pltyp", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..TABELA A964 (ZSDMF_A964) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A964 – Esta tabela conterá o percentual de juros
						if (!db.objectStoreNames.contains("A964")) {
							var objA964 = db.createObjectStore("A964", {
								keyPath: "idA964",
								unique: true
							});
							objA964.createIndex("werks", "werks", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..TABELA A965 (ZSDMF_A965) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A965 – Esta tabela será para cadastrar as famílias referente ao desconto normal
						if (!db.objectStoreNames.contains("A965")) {
							var objA965 = db.createObjectStore("A965", {
								keyPath: "idA965",
								unique: true
							});
							objA965.createIndex("werks", "werks", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..TABELA DE A966 (ZSDMF_A966) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A966 – Esta tabela fará o vínculo entre a tabela de preço e a regra da família
						if (!db.objectStoreNames.contains("A966")) {
							var objA966 = db.createObjectStore("A966", {
								keyPath: "idA966",
								unique: true
							});
							objA966.createIndex("werks", "werks", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..TABELA DE A967 (ZSDMF_A967) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A967 – Cadastro de range de quantidades para a regra de desconto normal.
						if (!db.objectStoreNames.contains("A967")) {
							var objA967 = db.createObjectStore("A967", {
								keyPath: "idA967",
								unique: true
							});
							objA967.createIndex("werks", "werks", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABELA DE A968 (ZSDMF_A968) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if (!db.objectStoreNames.contains("A968")) {
							var objDescPorQuant = db.createObjectStore("A968", {
								keyPath: "idA968",
								unique: true
							});
							objDescPorQuant.createIndex("matnr", "matnr", {
								unique: false
							});
							objDescPorQuant.createIndex("werks", "werks", {
								unique: false
							});
							objDescPorQuant.createIndex("zzGrpmat", "zzGrpmat", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..TABELA DE A969 (ZSDMF_A969) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						//A969 – Cadastro de range de quantidades para a regra de desconto extra.
						if (!db.objectStoreNames.contains("A969")) {
							var objA969 = db.createObjectStore("A969", {
								keyPath: "idA969",
								unique: true
							});
							objA969.createIndex("werks", "werks", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE KONM (ZSDMF_KONM) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// KONM – Tabela onde estarão os ranges de quantidades 
						if (!db.objectStoreNames.contains("Konm")) {
							var objKONM = db.createObjectStore("Konm", {
								keyPath: "idKonm",
								unique: true
							});
							objKONM.createIndex("knumh", "knumh", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpEnxoval (ZSDMF_CAMPANHA_ENXOVAL) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpEnxoval – Tabela de campanha de enxoval
						if (!db.objectStoreNames.contains("CmpEnxoval")) {
							var objCmpEnxoval = db.createObjectStore("CmpEnxoval", {
								keyPath: "idCmpEnxoval",
								unique: true,
								autoIncrement: true
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpGbGrpProdsAcabs (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpGbGrpProdsAcabs – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("CmpGbGrpProdsAcabs")) {
							var objCmpGbGrpProdsAcabs = db.createObjectStore("CmpGbGrpProdsAcabs", {
								keyPath: "idCmpGbGrpProdsAcabs",
								unique: true,
								autoIncrement: true
							});

							objCmpGbGrpProdsAcabs.createIndex("material", "material", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpGbItensBrindes (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpGbItensBrindes – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("CmpGbItensBrindes")) {
							var objCmpGbItensBrindes = db.createObjectStore("CmpGbItensBrindes", {
								keyPath: "idCmpGbItensBrindes",
								unique: true,
								autoIncrement: true
							});

							objCmpGbItensBrindes.createIndex("material", "material", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpGbProdsAcabs (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpGbProdsAcabs – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("CmpGbProdsAcabs")) {
							var objCmpGbProdsAcabs = db.createObjectStore("CmpGbProdsAcabs", {
								keyPath: "idCmpGbProdsAcabs",
								unique: true,
								autoIncrement: true
							});

							objCmpGbProdsAcabs.createIndex("grupo", "grupo", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpGbQtdItens (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpGbQtdItens – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("CmpGbQtdItens")) {
							var objCmpGbQtdItens = db.createObjectStore("CmpGbQtdItens", {
								keyPath: "idCmpGbQtdItens",
								unique: true,
								autoIncrement: true
							});
							
							objCmpGbQtdItens.createIndex("grupo", "grupo", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpProdsAcabs (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpProdsAcabs – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("CmpProdsAcabs")) {
							var objCmpProdsAcabs = db.createObjectStore("CmpProdsAcabs", {
								keyPath: "idCmpProdsAcabs",
								unique: true,
								autoIncrement: true
							});

							objCmpProdsAcabs.createIndex("material", "material", {
								unique: false
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpSldBrindes (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpSldBrindes – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("CmpSldBrindes")) {
							var objCmpSldBrindes = db.createObjectStore("CmpSldBrindes", {
								keyPath: "idCmpSldBrindes",
								unique: true,
								autoIncrement: true
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpSldBrindes (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpSldBrindes – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("FormasPagamentos")) {
							var objFormasPagamentos = db.createObjectStore("FormasPagamentos", {
								keyPath: "idFormasPagamentos",
								unique: true,
								autoIncrement: true
							});
						}
						
						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE CmpSldBrindes (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpSldBrindes – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("CmpPrzMed")) {
							var objCmpPrzMed = db.createObjectStore("CmpPrzMed", {
								keyPath: "idCmpPrzMed",
								unique: true,
								autoIncrement: true
							});
						}

						//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.. TABELA DE ZSDT040 (ZSDMF_CAMPANHA_GRP_PROD_ACAB) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						// CmpSldBrindes – Tabela de campanha Global grupo Produto Acabado 
						if (!db.objectStoreNames.contains("ControleAmostra")) {
							var objControleAmostra = db.createObjectStore("ControleAmostra", {
								keyPath: "idControleAmostra",
								unique: true,
								autoIncrement: true
							});
						}
					};

					open.onerror = function(hxr) {
						console.log("Erro ao abrir tabelas.");
						console.log(hxr.Message);
					};
					//Load tables
					open.onsuccess = function(e) {

						var db = e.target.result;
						var Werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

						var tx = db.transaction("Usuarios", "readwrite");
						var objUsuarios = tx.objectStore("Usuarios");

						var request = objUsuarios.get(Werks);

						request.onsuccess = function(evt) {

							var result = evt.target.result;

							if (result != null || result != undefined) {
								//var sData = that.retornaDataAtualizacao(result.dataAtualizacao);

								that.getOwnerComponent().getModel("modelAux").setProperty("/CodRepres", result.codRepres);
								that.getOwnerComponent().getModel("modelAux").setProperty("/CodUsr", result.codUsr);
								that.getOwnerComponent().getModel("modelAux").setProperty("/Tipousuario", result.tipousuario);

								that.getOwnerComponent().getModel("modelAux").setProperty("/DataAtualizacao", result.dataAtualizacao);
							}
						};
					};
				}
			},

			onInicializaModels: function() {

				var oModel = new sap.ui.model.json.JSONModel({
					Ntgew: 0,
					ValComissaoPedido: 0,
					ValVerbaPedido: 0,
					ValCampGlobal: 0,
					ValCampBrinde: 0,
					ValCampEnxoval: 0,
					ValDescontoTotal: 0,
					ValTotPed: 0,
					TotalItensPedido: 0,
					ValTotalExcedenteDescontos: 0,
					ValTotalAcresPrazoMed: 0,
					ValorEntradaPedido: 0,
					ValComissao: 0,
					ValMinPedido: 0,
					PercEntradaPedido: 0,
					ExisteEntradaPedido: "",
					Completo: "",
					NrPedCli: "",
					IdStatusPedido: "",
					SituacaoPedido: "",
					DataPedido: "",
					LocalEntrega: "",
					DiasPrimeiraParcela: "",
					QuantParcelas: "",
					IntervaloParcelas: "",
					ObservacaoPedido: "",
					ObservacaoAuditoriaPedido: "",
					TabPreco: "",
					TipoTransporte: "",
					TipoNegociacao: "",
					TipoPedido: "",
					DataImpl: ""
				});
				this.getOwnerComponent().setModel(oModel, "modelDadosPedido");

				var oModelAux = new sap.ui.model.json.JSONModel({
					CodRepres: "",
					Imei: "",
					Werks: "",
					VersaoApp: "",
					DataAtualizacao: "",
					Kunnr: "",
					NrPedCli: "",
					EditarIndexItem: "",
					IserirDiluicao: "",
					bConectado: false,
					bEnviarPedido: true,
					TelaAprovação: false
				});

				this.getOwnerComponent().setModel(oModelAux, "modelAux");

				var oModelCliente = new sap.ui.model.json.JSONModel({
					Kunnr: "",
					Land1: "",
					Name1: "",
					Name2: "",
					Ort01: "",
					Ort02: "",
					Regio: "",
					Stras: "",
					Pstlz: "",
					Stcd1: "",
					Stcd2: "",
					// Inco1: "",
					Parvw: "",
					Lifnr: "",
					efetuoucompra: ""
				});
				this.getOwnerComponent().setModel(oModelCliente, "modelCliente");

				var oModelItemPedido = new sap.ui.model.json.JSONModel({
					matnr: "", // - Cod Material
					maktx: "", // - Desc Material
					zzVprod: "", // – Valor do Produto 
					zzPercom: "", // – Percentual de Comissão
					zzPervm: "", // – Percentual de Verba
					zzDesext: "", // – Desconto Extra
					zzValmim: "" // – Valor Mínimo
				});

				this.getOwnerComponent().setModel(oModelItemPedido, "modelItemPedido");
			},

			retornaDataAtualizacao: function() {
				var date = new Date();
				var dia = String(date.getDate());
				var mes = String(date.getMonth() + 1);
				var ano = String(date.getFullYear());
				ano = ano.substring(2, 4);
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
				//var horario = String(hora) + ":" + String(minuto) + ":" + String(seg);
				var data = String(dia + "/" + mes + "/" + ano);
				var horario = String(hora) + ":" + String(minuto);

				return data + " - " + horario;
			},

			getPermissao: function() {
				var that = this;

				if (device.platform == 'Android') {
					window.plugins.sim.requestReadPermission(this.successCallback, this.errorCallback);

				}

				function successCallback(result) {
					console.log(result);
					that.getImei();
				}

				function errorCallback(error) {
					console.log(error);
					that.getImei();
				}
			},

			getImei: function() {
				var that = this;
				var isTablet = this.getOwnerComponent().getModel("modelAux").getProperty("/isTablet");
				var isTablet = "Android";
				if (device.platform == 'Android') {
					window.plugins.sim.hasReadPermission(successCallback1, errorCallback1);
					window.plugins.sim.requestReadPermission(successCallback2, errorCallback2);

					if (isTablet == true) {
						that.getOwnerComponent().getModel("modelAux").setProperty("/Imei", device.uuid);

					} else {
						window.plugins.sim.getSimInfo(successCallback3, errorCallback3);

					}

				} else if (device.platform == 'iOS') {

					that.getOwnerComponent().getModel("modelAux").setProperty("/Imei", device.uuid);

				}
				//checa permisao
				function successCallback1(result) {
					console.log(result);
				}

				function errorCallback1(error) {
					console.log(error);
				}
				//READ PERMISSION
				function successCallback2(result) {
					console.log(result);
				}

				function errorCallback2(error) {
					console.log(error);
				}
				//pega info device
				function successCallback3(result) {
					console.log(result);
					ImeiResult = result;
					that.getOwnerComponent().getModel("modelAux").setProperty("/Imei", ImeiResult.deviceId);
				}

				function errorCallback3(error) {
					console.log(error);
				}
			},

			onLoadTables: function() {

				var that = this;
				var Werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
				var ImeiCelular = this.getOwnerComponent().getModel("modelAux").getProperty("/Imei");
				ImeiCelular = "123456";
				var NumVersao = this.getOwnerComponent().getModel("modelAux").getProperty("/VersaoApp");
				var TipoUsuario = this.getOwnerComponent().getModel("modelAux").getProperty("/Tipousuario");
				var CodRepres = this.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres");
				var CodUsuario = this.getOwnerComponent().getModel("modelAux").getProperty("/CodUsr");

				//var oModel = that.getOwnerComponent().getModel("modelAux").getProperty("/DBModel")
				var oModel = that.getOwnerComponent().getModel("modelAux").getProperty("/DBModel");

				// var oModel = new sap.ui.model.odata.v2.ODataModel("http://104.208.137.3:8000/sap/opu/odata/sap/ZFORCA_VENDAS_VB_SRV/", { 
				// 	json     : true,
				// 	user     : "appadmin",
				// 	password : "sap123"
				// });

				oModel.setUseBatch(false);

				/* Verifico se exite algum docuemnto (pedido, entrega futura) pra enviar antes de atualizar a base */
				// Verifico pedido de vendas
				var bExisteDocPendente = false;

				var open = indexedDB.open("VB_DataBase");

				open.onsuccess = function() {
					var db = open.result;

					var store = db.transaction("PrePedidos").objectStore("PrePedidos");
					var indiceStatusPed = store.index("idStatusPedido");

					var request = indiceStatusPed.getAll(2); // 2 -> Status Pendente (envio)

					var oDocsPendentes = [];
					request.onsuccess = function(event) {
						oDocsPendentes = event.target.result;

						// bExisteDocPendente = (oDocsPendentes.length > 0);
						bExisteDocPendente = false;
					};

					if (bExisteDocPendente) {
						MessageBox.show(
							"Existe(m) pedido(s) de vendas a ser enviados, por favor verifique..", {
								icon: MessageBox.Icon.ERROR,
								title: "Erro ao atualizar bases.",
								actions: [MessageBox.Action.OK],
								onClose: function() {
									bExisteDocPendente = false;
									return;
								}
							});
					}

					store = db.transaction("EntregaFutura2").objectStore("EntregaFutura2");
					request = store.getAll();

					request.onsuccess = function(event) {
						oDocsPendentes = event.target.result;

						// bExisteDocPendente = (oDocsPendentes.length > 0);
						bExisteDocPendente = false;
						if (bExisteDocPendente) {
							MessageBox.show(
								"Existe(m) entrega(s) de vendas a ser(em) enviadas, por favor verifique..", {
									icon: MessageBox.Icon.ERROR,
									title: "Erro ao atualizar bases.",
									actions: [MessageBox.Action.OK],
									onClose: function() {
										bExisteDocPendente = false;
										return;
									}
								});
						} else {

							MessageBox.show("Você deseja atualizar as tabelas?", {
								icon: MessageBox.Icon.QUESTION,
								title: "Atualização das tabelas.",
								actions: [MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
								onClose: function(oAction) {
									if (oAction === sap.m.MessageBox.Action.YES) {

										var vTables = ["Clientes", "A969", "A959", "A960", "A961", "A962", "A963", "A964", "A965", "A966", "A967", "A968",
											"Materiais", "TitulosAbertos", "Konm", "TiposPedidos", "FormasPagamentos", "StatusPedidos", "CmpGbItensBrindes", "EntregaFutura3", "CmpPrzMed",
											"CmpSldBrindes", "CmpProdsAcabs", "CmpGbQtdItens", "CmpGbProdsAcabs", "CmpGbGrpProdsAcabs", "CmpEnxoval", "EntregaFutura", "ControleAmostra", "SaldoVerba"
										];

										that.DropDBTables(vTables);

										if (!that._CreateMaterialFragment) {

											that._ItemDialog = sap.ui.xmlfragment(
												"testeui5.view.busyDialog",
												that
											);
											that.getView().addDependent(that._ItemDialog);
										}

										that._ItemDialog.open();

										var tx = db.transaction("Usuarios", "readwrite");
										var objUsuarios = tx.objectStore("Usuarios");

										request = objUsuarios.get(Werks);

										request.onsuccess = function(e1) {

											var result1 = e1.target.result;

											if (result1 !== null && result1 !== undefined) {

												oModel.read("/Login(IvCodRepres='" + result1.codUsr + "',IvWerks='" + Werks + "',IvSenha='" + result1.senha +
													"',IvImei='" + ImeiCelular + "',IvVersaoapp='" + NumVersao + "')", {
														success: function(retorno) {
															if (retorno.EvRettyp == "E") {

																sap.m.MessageBox.show(
																	retorno.EvReturn, {
																		icon: sap.m.MessageBox.Icon.WARNING,
																		title: "Falha ao realizar Login!",
																		actions: [sap.m.MessageBox.Action.OK],
																		onClose: function(oAction) {
																			if (that._ItemDialog) {
																				that._ItemDialog.destroy(true);
																			}
																		}
																	}
																);

															} else if (retorno.EvRettyp == "S") {

																oModel.read("/A959", {
																	success: function(retornoA959) {
																		var txA959 = db.transaction("A959", "readwrite");
																		var objA959 = txA959.objectStore("A959");

																		for (var i = 0; i < retornoA959.results.length; i++) {

																			var objBancoA959 = {
																				idA959: retornoA959.results[i].Werks + "." +
																					retornoA959.results[i].Pltyp,
																				kappl: retornoA959.results[i].Kappl,
																				kschl: retornoA959.results[i].Kschl,
																				werks: retornoA959.results[i].Werks,
																				pltyp: retornoA959.results[i].Pltyp,
																				zzPrzminav: retornoA959.results[i].ZzPrzminav,
																				zzPrzminap: retornoA959.results[i].ZzPrzminap,
																				zzVlrPedMin: retornoA959.results[i].ZzVlrPedMin,
																				zzPrzmaxav: retornoA959.results[i].ZzPrzmaxav,
																				zzPrzmaxap: retornoA959.results[i].ZzPrzmaxap,
																				kfrst: retornoA959.results[i].Kfrst,
																				datbi: retornoA959.results[i].Datbi,
																				datab: retornoA959.results[i].Datab,
																				kbstat: retornoA959.results[i].Kbstat,
																				knumh: retornoA959.results[i].Knumh
																			};

																			var requestA959 = objA959.add(objBancoA959);

																			requestA959.onsuccess = function(event) {
																				console.log("Dados A959 inseridos. " + event);
																			};

																			requestA959.onerror = function(event) {
																				console.log("Dados A959 não foram inseridos :" + event);
																			};
																		}

																		oModel.read("/TiposPedidos", {
																			success: function(retornoTiposPedidos) {

																				var txTiposPedidos = db.transaction("TiposPedidos", "readwrite");
																				var objTiposPedidos = txTiposPedidos.objectStore("TiposPedidos");

																				for (i = 0; i < retornoTiposPedidos.results.length; i++) {

																					var objBancoTiposPedidos = {
																						idTipoPedido: retornoTiposPedidos.results[i].IdTipoPedido,
																						descricao: retornoTiposPedidos.results[i].Descricao
																					};

																					var requestTiposPedidos = objTiposPedidos.add(objBancoTiposPedidos);

																					requestTiposPedidos.onsuccess = function(event) {
																						console.log("Dados TiposPedidos inseridos");
																					};
																					requestTiposPedidos.onerror = function(event) {
																						console.log("Dados TiposPedidos não foram inseridos :" + event);
																					};
																				}

																				oModel.read("/TitulosAbertos", {
																					urlParameters: {
																						"$filter": "IvRepres eq '" + CodRepres + "'"
																					},
																					success: function(retornoTitulosAbertos) {

																						var txTitulosAbertos = db.transaction("TitulosAbertos", "readwrite");
																						var objTitulosAbertos = txTitulosAbertos.objectStore("TitulosAbertos");
																						// objTitulosAbertos.autoIncrement();

																						Date.prototype.shiftDays = function(days) {
																							days = parseInt(days, 10);
																							this.setDate(this.getDate() + days);
																							return this;
																						};

																						for (i = 0; i < retornoTitulosAbertos.results.length; i++) {

																							var dataVenc = retornoTitulosAbertos.results[i].Zfbdt;
																							dataVenc = dataVenc.shiftDays(1);

																							var auxDmbtr = parseFloat(retornoTitulosAbertos.results[i].Dmbtr);
																							var date = retornoTitulosAbertos.results[i].Budat;
																							var dia = String(date.getDate());
																							var mes = String(date.getMonth() + 1);
																							var ano = String(date.getFullYear());
																							ano = ano.substring(2, 4);
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
																							//var horario = String(hora) + ":" + String(minuto) + ":" + String(seg);
																							var data = String(dia + "/" + mes + "/" + ano);

																							var objBancoTitulosAbertos = {
																								// idTituloAberto: retornoTitulosAbertos.results[i].Belnr + "." + retornoTitulosAbertos.results[
																								// 		i].Kunnr + "." +
																								// 	auxDmbtr + "." + data,
																								idTituloAberto: String(i),
																								belnr: retornoTitulosAbertos.results[i].Belnr,
																								name1: retornoTitulosAbertos.results[i].Name1,
																								budat: retornoTitulosAbertos.results[i].Budat, //Data emissão
																								zfbdt: dataVenc, //Data vencimento
																								dmbtr: auxDmbtr,
																								kunnr: retornoTitulosAbertos.results[i].Kunnr
																							};

																							var requestTitulosAbertos = objTitulosAbertos.add(objBancoTitulosAbertos);

																							requestTitulosAbertos.onsuccess = function(event) {
																								event.stopPropagation();
																								console.log("Dados TitulosAbertos inseridos");
																							};
																							requestTitulosAbertos.onerror = function(event) {
																								event.stopPropagation();
																								console.log("Dados TitulosAbertos não foram inseridos :" + event.srcElement.error);
																							};
																						}

																						//Clientes
																						oModel.read("/Clientes", {
																							urlParameters: {
																								"$filter": "IvRepres eq '" + CodRepres + "' and IvUsuario eq '" + CodUsuario + "'"
																							},
																							success: function(retornoCliente) {

																								var txCliente = db.transaction("Clientes", "readwrite");
																								var objCliente = txCliente.objectStore("Clientes");

																								for (i = 0; i < retornoCliente.results.length; i++) {

																									var objBancoCliente = {
																										kunnr: retornoCliente.results[i].Kunnr,
																										land1: retornoCliente.results[i].Land1,
																										name1: retornoCliente.results[i].Name1,
																										name2: retornoCliente.results[i].Name2,
																										ort01: retornoCliente.results[i].Ort01,
																										ort02: retornoCliente.results[i].Ort02,
																										regio: retornoCliente.results[i].Regio,
																										stras: retornoCliente.results[i].Stras,
																										pstlz: retornoCliente.results[i].Pstlz,
																										stcd1: retornoCliente.results[i].Stcd1,
																										stcd2: retornoCliente.results[i].Stcd2,
																										// inco1: retornoCliente.results[i].Inco1,
																										parvw: retornoCliente.results[i].Parvw,
																										lifnr: retornoCliente.results[i].Lifnr,
																										efetuoucompra: retornoCliente.results[i].Efetuoucompra,
																										telf1: retornoCliente.results[i].Telf1
																									};

																									var requestCliente = objCliente.add(objBancoCliente);

																									objBancoCliente = {
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
																										// inco1: "",
																										parvw: "",
																										lifnr: "",
																										telf1: "",
																										efetuoucompra: ""
																									};

																									requestCliente.onsuccess = function(event) {
																										console.log("Dados Clientes inseridos");
																									};
																									requestCliente.onerror = function(event) {
																										console.log("Dados Clientes não foram inseridos :" + event);
																									};
																								}

																								oModel.read("/Materiais", {
																									success: function(retornoMateriais) {

																										var txMateriais = db.transaction("Materiais", "readwrite");
																										var objMateriais = txMateriais.objectStore("Materiais");

																										for (i = 0; i < retornoMateriais.results.length; i++) {

																											var objBancoMateriais = {
																												matnr: retornoMateriais.results[i].Matnr,
																												meins: retornoMateriais.results[i].Meins,
																												maktx: retornoMateriais.results[i].Maktx,
																												aumng: retornoMateriais.results[i].Aumng,
																												scmng: retornoMateriais.results[i].Scmng,
																												vrkme: retornoMateriais.results[i].Vrkme,
																												mtpos: retornoMateriais.results[i].Mtpos,
																												ntgew: retornoMateriais.results[i].Ntgew,
																												provg: retornoMateriais.results[i].Provg,
																												extwg: retornoMateriais.results[i].Extwg
																											};

																											var requestMateriais = objMateriais.add(objBancoMateriais);

																											requestMateriais.onsuccess = function(event) {
																												console.log("Dados Materiais inseridos. " + event);
																											};

																											requestMateriais.onerror = function(event) {
																												console.log("Dados Materiais não foram inseridos :" + event);
																											};
																										}

																										oModel.read("/A960", {
																											success: function(retornoA960) {

																												var txA960 = db.transaction("A960", "readwrite");
																												var objA960 = txA960.objectStore("A960");

																												for (i = 0; i < retornoA960.results.length; i++) {
																													var objBancoA960 = {
																														idA960: retornoA960.results[i].Werks + "." + retornoA960.results[i]
																															.Pltyp +
																															"." + retornoA960.results[i].Matnr,
																														kappl: retornoA960.results[i].Kappl,
																														kschl: retornoA960.results[i].Kschl,
																														werks: retornoA960.results[i].Werks,
																														pltyp: retornoA960.results[i].Pltyp,
																														// inco1: retornoA960.results[i].Inco1,
																														matnr: retornoA960.results[i].Matnr,
																														kfrst: retornoA960.results[i].Kfrst,
																														datbi: retornoA960.results[i].Datbi,
																														datab: retornoA960.results[i].Datab,
																														kbstat: retornoA960.results[i].Kbstat,
																														zzVprod: retornoA960.results[i].ZzVprod,
																														zzPercom: retornoA960.results[i].ZzPercom,
																														zzPervm: retornoA960.results[i].ZzPervm,
																														knumh: retornoA960.results[i].Knumh
																													};

																													var requestA960 = objA960.add(objBancoA960);

																													requestA960.onsuccess = function(event) {
																														console.log("Dados A960 inseridos. " + event);
																													};

																													requestA960.onerror = function(event) {
																														console.log("Dados A960 não foram inseridos :" + event);
																													};
																												}

																												oModel.read("/A961 ", {
																													success: function(retornoA961) {

																														var txClienteTabPreco = db.transaction("A961", "readwrite");
																														var objClienteTabPreco = txClienteTabPreco.objectStore("A961");

																														for (i = 0; i < retornoA961.results.length; i++) {

																															var objBancoA961 = {
																																idA961: retornoA961.results[i].Werks + "." +
																																	retornoA961.results[i].Kunnr + "." + retornoA961.results[i].Pltyp,
																																kunnr: retornoA961.results[i].Kunnr,
																																werks: retornoA961.results[i].Werks,
																																pltyp: retornoA961.results[i].Pltyp,
																																ptext: retornoA961.results[i].Ptext
																															};

																															var requestA961 = objClienteTabPreco.add(objBancoA961);
																															requestA961.onsuccess = function(event) {
																																console.log("Dados A961 inseridos. " + event);
																															};

																															requestA961.onerror = function(event) {
																																console.log("Dados A961 não foram inseridos :" + event);
																															};
																														}

																														oModel.read("/A962 ", {
																															success: function(retornoA962) {

																																var txA962 = db.transaction("A962", "readwrite");
																																var objA962 = txA962.objectStore("A962");

																																for (i = 0; i < retornoA962.results.length; i++) {

																																	var objBancoA962 = {
																																		idA962: retornoA962.results[i].Werks + "." +
																																			retornoA962.results[i].ZzGrpmat + "." +
																																			retornoA962.results[i].Matnr,
																																		zzGrpmat: retornoA962.results[i].ZzGrpmat,
																																		werks: retornoA962.results[i].Werks,
																																		matnr: retornoA962.results[i].Matnr
																																	};

																																	var requestA962 = objA962.add(objBancoA962);

																																	requestA962.onsuccess = function(event) {
																																		console.log("Dados A962 inseridos. " + event);
																																	};

																																	requestA962.onerror = function(event) {
																																		console.log("Dados A962 não foram inseridos :" + event);
																																	};
																																}

																																oModel.read("/A963 ", {
																																	urlParameters: {
																																		"$filter": "IRepres eq '" + CodRepres + "'"
																																	},
																																	success: function(retornoA963) {

																																		var txA963 = db.transaction("A963", "readwrite");
																																		var objA963 = txA963.objectStore("A963");

																																		for (i = 0; i < retornoA963.results.length; i++) {

																																			var objBancoA963 = {
																																				idA963: retornoA963.results[i].Werks + "." +
																																					retornoA963.results[i].Lifnr + "." + retornoA963.results[i].Pltyp,
																																				lifnr: retornoA963.results[i].Lifnr,
																																				werks: retornoA963.results[i].Werks,
																																				pltyp: retornoA963.results[i].Pltyp,
																																				ptext: retornoA963.results[i].Ptext
																																			};

																																			var requestA963 = objA963.add(objBancoA963);

																																			requestA963.onsuccess = function(event) {
																																				console.log("Dados A963 inseridos. " + event);
																																			};

																																			requestA963.onerror = function(event) {
																																				console.log("Dados A963 não foram inseridos :" +
																																					event);
																																			};
																																		}

																																		oModel.read("/A964", {
																																			success: function(retornoA964) {

																																				var txA964 = db.transaction("A964", "readwrite");
																																				var objA964 = txA964.objectStore("A964");

																																				for (i = 0; i < retornoA964.results.length; i++) {

																																					var objBancoA964 = {
																																						idA964: retornoA964.results[i].Werks + "." +
																																							retornoA964.results[i].ZzPerjur,
																																						werks: retornoA964.results[i].Werks,
																																						zzPerjur: retornoA964.results[i].ZzPerjur
																																					};

																																					var requestA964 = objA964.add(objBancoA964);

																																					requestA964.onsuccess = function(event) {
																																						console.log("Dados A964 inseridos. " + event);
																																					};

																																					requestA964.onerror = function(event) {
																																						console.log("Dados A964 não foram inseridos :" +
																																							event);
																																					};
																																				}

																																				oModel.read("/A965", { // A965
																																					success: function(retornoA965) {

																																						var txA965 = db.transaction("A965",
																																							"readwrite");
																																						var objA965 = txA965.objectStore("A965");

																																						for (i = 0; i < retornoA965.results.length; i++) {

																																							var objBancoA965 = {
																																								idA965: retornoA965.results[i].Werks + "." +
																																									retornoA965.results[i].ZzGrpmat + "." +
																																									retornoA965.results[i].Matnr,
																																								werks: retornoA965.results[i].Werks,
																																								zzGrpmat: retornoA965.results[i].ZzGrpmat,
																																								matnr: retornoA965.results[i].Matnr
																																							};

																																							var requestA965 = objA965.add(objBancoA965);

																																							requestA965.onsuccess = function(event) {
																																								console.log("Dados A965 inseridos. " + event);
																																							};

																																							requestA965.onerror = function(event) {
																																								console.log(
																																									"Dados A965 não foram inseridos :" + event);
																																							};
																																						}

																																						oModel.read("/A966", {
																																							success: function(retornoA966) {

																																								var txA966 = db.transaction("A966",
																																									"readwrite");
																																								var objA966 = txA966.objectStore("A966");

																																								for (i = 0; i < retornoA966.results.length; i++) {

																																									var objBancoA966 = {
																																										idA966: retornoA966.results[i].Werks + "." +
																																											retornoA966.results[i].ZzRegra + "." +
																																											retornoA966.results[i].ZzGrpmat + "." +
																																											retornoA966.results[i].Pltyp,
																																										werks: retornoA966.results[i].Werks,
																																										zzRegra: retornoA966.results[i].ZzRegra,
																																										zzGrpmat: retornoA966.results[i].ZzGrpmat,
																																										pltyp: retornoA966.results[i].Pltyp,
																																										zzTexto: retornoA966.results[i].ZzTexto
																																									};

																																									var requestA966 = objA966.add(
																																										objBancoA966);

																																									requestA966.onsuccess = function(event) {
																																										console.log("Dados A966 inseridos. " +
																																											event);
																																									};

																																									requestA966.onerror = function(event) {
																																										console.log(
																																											"Dados A966 não foram inseridos :" +
																																											event);
																																									};

																																								}

																																								oModel.read("/A967", {
																																									success: function(retornoA967) {

																																										var txA967 = db.transaction("A967", "readwrite");
																																										var objA967 = txA967.objectStore("A967");

																																										for (i = 0; i < retornoA967.results.length; i++) {

																																											var objBancoA967 = {
																																												idA967: retornoA967.results[i].Werks + "." +
																																													retornoA967.results[i].ZzRegra + "." +
																																													retornoA967.results[i].Knumh,
																																												werks: retornoA967.results[i].Werks,
																																												zzRegra: retornoA967.results[i].ZzRegra,
																																												knumh: retornoA967.results[i].Knumh
																																											};

																																											var requestA967 = objA967.add(
																																												objBancoA967);

																																											requestA967.onsuccess = function(event) {
																																												console.log("Dados A967 inseridos. " + event);
																																											};

																																											requestA967.onerror = function(event) {
																																												console.log(
																																													"Dados A967 não foram inseridos :" + event);
																																											};
																																										}

																																										oModel.read("/Konm", {
																																											success: function(retornoKonm) {

																																												var txKonm = db.transaction("Konm", "readwrite");
																																												var objKonm = txKonm.objectStore("Konm");

																																												for (i = 0; i < retornoKonm.results.length; i++) {

																																													var objBancoKonm = {
																																														idKonm: retornoKonm.results[i].Knumh + "." +
																																															retornoKonm.results[i].Kstbm + "." +
																																															retornoKonm.results[i].Kbetr,
																																														knumh: retornoKonm.results[i].Knumh, //(Condição define qual valor de range pegar)
																																														kstbm: retornoKonm.results[i].Kstbm, //Escala até
																																														kbetr: retornoKonm.results[i].Kbetr //Percentual de desconto
																																													};

																																													var requestKonm = objKonm.add(objBancoKonm);

																																													requestKonm.onsuccess =
																																														function(event) {
																																															console.log("Dados Konm inseridos. " + event);
																																														};

																																													requestKonm.onerror =
																																														function(event) {
																																															console.log("Dados Konm não foram inseridos :" + event);
																																														};
																																												}

																																												oModel.read("/A968", {
																																													success: function(retornoA968) {

																																														var txA968 = db.transaction("A968", "readwrite");
																																														var objA968 = txA968.objectStore("A968");

																																														for (i = 0; i < retornoA968.results.length; i++) {

																																															var objBancoA968 = {
																																																idA968: retornoA968.results[i].Werks + "." +
																																																	retornoA968.results[i].ZzRegra + "." +
																																																	retornoA968.results[i].ZzGrpmat + "." +
																																																	retornoA968.results[i].Pltyp,
																																																werks: retornoA968.results[i].Werks,
																																																zzRegra: retornoA968.results[i].ZzRegra,
																																																zzGrpmat: retornoA968.results[i].ZzGrpmat,
																																																pltyp: retornoA968.results[i].Pltyp,
																																																zzTexto: retornoA968.results[i].ZzTexto
																																															};
																																															var requestA968 = objA968.add(objBancoA968);

																																															requestA968.onsuccess = function(event) {
																																																console.log("Dados A968 inseridos. " + event);
																																															};

																																															requestA968.onerror = function(event) {
																																																console.log("Dados A968 não foram inseridos :" + event);
																																															};
																																														}

																																														oModel.read("/A969", {
																																															success: function(retornoA969) {
																																																var txA969 = db.transaction("A969", "readwrite");
																																																var objA969 = txA969.objectStore("A969");

																																																for (i = 0; i < retornoA969.results.length; i++) {

																																																	var objBancoA969 = {
																																																		idA969: retornoA969.results[i].Werks + "." +
																																																			retornoA969.results[i].ZzRegra + "." +
																																																			retornoA969.results[i].Knumh,
																																																		werks: retornoA969.results[i].Werks,
																																																		zzRegra: retornoA969.results[i].ZzRegra,
																																																		knumh: retornoA969.results[i].Knumh
																																																	};

																																																	var requestA969 = objA969.add(objBancoA969);

																																																	requestA969.onsuccess = function(event) {
																																																		console.log("Dados A969 inseridos. " + event);
																																																	};

																																																	requestA969.onerror = function(event) {
																																																		console.log("Dados A969 não foram inseridos :" + event);
																																																	};
																																																}
																																																
																																																oModel.read("/FormasPagamentos", {
																																																	urlParameters: {
																																																		"$filter": "IvCodRepres eq '" + CodRepres + "'"
																																																	},
																																																	success: function(retornoFormasPagamentos) {
																																																		var txFormasPagamentos = db.transaction("FormasPagamentos", "readwrite");
																																																		var objFormasPagamentos = txFormasPagamentos.objectStore("FormasPagamentos");

																																																		for (i = 0; i < retornoFormasPagamentos.results.length; i++) {

																																																			var objBancoFormasPagamentos = {
																																																				idFormasPagamentos: i,
																																																				zlsch: retornoFormasPagamentos.results[i].Zlsch,
																																																				text1: retornoFormasPagamentos.results[i].Text1
																																																			};

																																																			var requestFormasPagamentos = objFormasPagamentos.put(objBancoFormasPagamentos);

																																																			requestFormasPagamentos.onsuccess = function(event) {
																																																				console.log("Dados FormasPagamentos inseridos. " + event);
																																																			};

																																																			requestFormasPagamentos.onerror = function(event) {
																																																				console.log("Dados FormasPagamentos não foram inseridos :" + event);
																																																			};
																																																		}
																																																	
																																																	
																																																	MessageBox.show(
																																																		"Tabelas carregadas com sucesso!", {
																																																			icon: MessageBox.Icon.SUCCESS,
																																																			title: "Carregamento Completo",
																																																			actions: [MessageBox.Action.OK],
																																																			onClose: function() {
																																																				if (that._ItemDialog) {
																																																					that._ItemDialog.destroy(true);
																																																				}
																																																				that.onUpdateDateTime();
																																																			}
																																																		});
																																																},
																																																error: function(error) {
																																																	console.log(error);
																																																	that.onMensagemErroODATA(error.statusCode);
																																																}
																																															});
																																																
																																															},
																																															error: function(error) {
																																																console.log(error);
																																																that.onMensagemErroODATA(
																																																	error
																																																	.statusCode);
																																															}
																																														});
																																													},
																																													error: function(error) {
																																														console.log(error);
																																														that.onMensagemErroODATA(error.statusCode);
																																													}
																																												});
																																											},
																																											error: function(error) {
																																												console.log(error);
																																												that.onMensagemErroODATA(error.statusCode);
																																											}
																																										});
																																									},
																																									error: function(error) {
																																										console.log(error);
																																										that.onMensagemErroODATA(error.statusCode);
																																									}
																																								});
																																							},
																																							error: function(error) {
																																								console.log(error);
																																								that.onMensagemErroODATA(error.statusCode);
																																							}
																																						});
																																					},
																																					error: function(error) {
																																						console.log(error);
																																						that.onMensagemErroODATA(error.statusCode);
																																					}
																																				});
																																			},
																																			error: function(error) {
																																				console.log(error);
																																				that.onMensagemErroODATA(error.statusCode);
																																			}
																																		});
																																	},
																																	error: function(error) {
																																		console.log(error);
																																		that.onMensagemErroODATA(error.statusCode);
																																	}
																																});
																															},
																															error: function(error) {
																																console.log(error);
																																that.onMensagemErroODATA(error.statusCode);
																															}
																														});
																													},
																													error: function(error) {
																														console.log(error);
																														that.onMensagemErroODATA(error.statusCode);
																													}
																												});
																											},
																											error: function(error) {
																												console.log(error);
																												that.onMensagemErroODATA(error.statusCode);
																											}
																										});
																									},
																									error: function(error) {
																										console.log(error);
																										that.onMensagemErroODATA(error.statusCode);
																									}
																								});
																							},
																							error: function(error) {
																								console.log(error);
																								that.onMensagemErroODATA(error.statusCode);
																							}
																						});
																					},
																					error: function(error) {
																						console.log(error);
																						that.onMensagemErroODATA(error.statusCode);
																					}
																				});
																			},
																			error: function(error) {
																				console.log(error);
																				that.onMensagemErroODATA(error.statusCode);
																			}
																		});
																	},
																	error: function(error) {
																		console.log(error);
																		that.onMensagemErroODATA(error.statusCode);
																	}
																});
															}
														},
														error: function(error) {
															console.log(error);
															that.onMensagemErroODATA(error.statusCode);
														}
													});
											} else {
												MessageBox.show(
													"Por Favor Faça o preenchimento de credenciais em pelo menos uma empresa antes de atualizar as tabelas.", {
														icon: MessageBox.Icon.ERROR,
														title: "Erro com as credenciais",
														actions: [MessageBox.Action.OK],
														onClose: function() {
															that._ItemDialog.close();
														}
													});
											}
										};
										request.onerror = function(ex) {
											console.log(ex);
											console.log("Não foi possivel encontrar o registro na tabela de usuários");
										};
									}
								}
							});
						}
					};
				};
				/*-------------------------------------------------------------------------------------------------*/
			},

			onAfterRendering: function() {

			},

			DropDBTables: function(vTables) {
				var open = indexedDB.open("VB_DataBase");

				open.onerror = function(e) {
					console.log("Erro ao abrir conexão.");
					console.log(e.Message);
				};

				open.onsuccess = function(e) {
					var db = e.target.result;

					for (var i = 0; i <= vTables.length - 1; i++) {
						var sTableName = vTables[i];

						var transaction = db.transaction(sTableName, "readwrite");
						var objectStore = transaction.objectStore(sTableName);
						var objectStoreRequest = objectStore.clear();

						objectStoreRequest.onsuccess = function(event) {
							console.log("Dados da tabela " + sTableName + " removidos com sucesso");
						};
						objectStoreRequest.onerror = function(event) {
							console.log("Erro ao limpar tabela " + sTableName);
						};

					}
				};
			},

			onBusyDialogClosed: function() {

				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}
			},

			onBusyDialogClosed2: function() {

				if (this._ItemDialog2) {
					this._ItemDialog2.destroy(true);
				}
			},

			onBusyDialogClosed3: function() {

				if (this._ItemDialog3) {
					this._ItemDialog3.destroy(true);
				}
			},

			onStartWorking: function() {
				var that = this;
				var open = indexedDB.open("VB_DataBase");

				open.onerror = function(hxr) {
					console.log("Erro ao abrir tabelas.");
					console.log(hxr.Message);
				};

				open.onsuccess = function(e) {
					var db = e.target.result;
					var tx = db.transaction("Usuarios", "readwrite");
					var objUsuarios = tx.objectStore("Usuarios");
					var Werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

					var request = objUsuarios.get(Werks);

					/* Verifico se existe a tabela de Usuários.*/
					request.onsuccess = function(e1) {
						var result1 = e1.target.result;

						if (result1 == undefined) {
							MessageBox.show(
								"Por Favor atualize o banco de dados para conectar no sistema.", {
									icon: MessageBox.Icon.ERROR,
									title: "Banco de dados desatualizado",
									actions: [MessageBox.Action.OK],
									onClose: function() {
										return;
									}
								});
						}

						that.getOwnerComponent().getModel("modelAux").setProperty("/Usuario", result1);
						var oPrincipal = that.getView().getModel("menu").getProperty("/Principal");

						var bAtualizarTabelas = false;

						var sData = result1.dataAtualizacao;
						var dData;
						var dDataAtual = new Date();

						if (sData == undefined || sData.trim() == "") {
							bAtualizarTabelas = true;
						}

						var iDia = parseInt(sData.substring(0, 2));
						var iMes = parseInt(sData.substring(3, 5));
						var iAno = parseInt(sData.substring(6, 8));

						var iDiaAtual = dDataAtual.getDate();
						var iMesAtual = dDataAtual.getMonth() + 1;
						var iAnoAtual = dDataAtual.getYear() - 100;

						if (iAno === iAnoAtual) {
							if (iMes === iMesAtual) {
								if (iDia === iDiaAtual) {
									bAtualizarTabelas = false;
								} else {
									bAtualizarTabelas = true;
								}
							} else {
								bAtualizarTabelas = true;
							}
						} else {
							bAtualizarTabelas = true;
						}

						if (bAtualizarTabelas) {
							MessageBox.show(
								"Por Favor atualize o banco de dados para conectar no sistema.", {
									icon: MessageBox.Icon.ERROR,
									title: "Banco de dados desatualizado",
									actions: [MessageBox.Action.OK],
									onClose: function() {}
								});

							return;
						}

						/* 
							Verifico se a data de atualização é a data corrente
							(O usuário deve atualizar na primeira vez)
						*/

						if (result1 !== null && result1 !== undefined) {
							var IdBase1 = that.getOwnerComponent().getModel("modelAux").getProperty("/IdBase");
							var numVersao = that.getOwnerComponent().getModel("modelAux").getProperty("/versaoApp");
							that.getOwnerComponent().getModel("modelAux").setProperty("/bConectado", true);

							that.getOwnerComponent().getModel("modelAux").setProperty("/homeVisible", true);
							sap.ui.core.UIComponent.getRouterFor(that).navTo("menu");
						} else {
							MessageBox.show(
								"Por Favor Faça o preenchimento de credenciais em pelo menos uma empresa antes de atualizar as tabelas.", {
									icon: MessageBox.Icon.ERROR,
									title: "Erro com as credenciais",
									actions: [MessageBox.Action.OK],
									onClose: function() {
										that._ItemDialog.close();
									}
								});
						}
					};
				};
			},

			onEnviarDocs: function() {
				var that = this;

				var open = indexedDB.open("VB_DataBase");

				open.onerror = function(hxr) {
					console.log("Erro ao abrir tabelas.");
					console.log(hxr.Message);
				};

				open.onsuccess = function(e) {
					var db = e.target.result;
					var tx = db.transaction("Usuarios", "readwrite");
					var objUsuarios = tx.objectStore("Usuarios");
					var Werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

					var request = objUsuarios.get(Werks);

					/* Verifico se existe a tabela de Usuários.*/
					request.onsuccess = function(e1) {
						var result1 = e1.target.result;

						if (result1 == undefined) {
							MessageBox.show(
								"Por Favor atualize o banco de dados para conectar no sistema.", {
									icon: MessageBox.Icon.ERROR,
									title: "Banco de dados desatualizado",
									actions: [MessageBox.Action.OK],
									onClose: function() {
										return;
									}
								});

						} else {

							that.getOwnerComponent().getModel("modelAux").setProperty("/Usuario", result1);

							sap.m.MessageBox.warning(
								"Escolha o documento que gostaria de enviar.", {
									title: "Envio de documentos",
									actions: ["Pedido", "Entrega", sap.m.MessageBox.Action.CANCEL],
									onClose: function(sAction) {
										switch (sAction) {
											case "Pedido":
												that.getOwnerComponent().getModel("modelAux").setProperty("/bEnviarPedido", true);
												sap.ui.core.UIComponent.getRouterFor(that).navTo("enviarPedidos");
												break;
											case "Entrega":
												that.getOwnerComponent().getModel("modelAux").setProperty("/bEnviarPedido", false);
												sap.ui.core.UIComponent.getRouterFor(that).navTo("enviarPedidos");
												break;
											case "CANCEL":
												return;
										}
									}
								}
							);
						}
					};
				};
			},

			//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> DIALOG CREDENCIAIS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
			onOpenCredenciais: function() {

				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}

				var that = this;

				if (!this._CreateMaterialFragment) {
					this._ItemDialog = sap.ui.xmlfragment(
						"testeui5.view.salvarLogin",
						this
					);

					this.getView().addDependent(this._ItemDialog);

				}

				this._ItemDialog.open();

				var open = indexedDB.open("VB_DataBase");

				open.onerror = function(hxr) {
					console.log("Erro ao abrir tabelas.");
					console.log(hxr.Message);
				};

				open.onsuccess = function(e) {

					var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
					var db = e.target.result;

					var objUsuarios = db.transaction(["Usuarios"], "readwrite");
					var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

					var request = objectStoreUsuarios.get(werks);

					request.onsuccess = function(e) {

						var result = e.target.result;
						if (result !== null && result !== undefined) {

							sap.ui.getCore().byId("idUsuario").setValue(result.codUsr);
							that.getOwnerComponent().getModel("modelAux").setProperty("/CodUsr", result.codUsr);

							sap.ui.getCore().byId("idUsuario").setEnabled(false);
							sap.ui.getCore().byId("idSenha").setValue(result.senha);

						}
					};
				};
			},

			onUpdateDateTime: function() {
				var that = this;
				var open = indexedDB.open("VB_DataBase");
				var Werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

				open.onsuccess = function(e) {
					var db = e.target.result;

					var objUsuarios = db.transaction(["Usuarios"], "readwrite");
					var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

					var request = objectStoreUsuarios.get(Werks);

					request.onsuccess = function(e) {
						var data = e.target.result;

						data.dataAtualizacao = that.retornaDataAtualizacao();
						var requestUpdate = objectStoreUsuarios.put(data);

						requestUpdate.onsuccess = function() {
							console.log("Data de atualização das tabelas atualizada");

							that.getOwnerComponent().getModel("modelAux").setProperty("/DataAtualizacao", data.dataAtualizacao);
						};

						requestUpdate.onerror = function() {
							console.log("Erro ao atualizar campo data de atualização no banco.");
						};
					};
				};
			},

			onLoginChange: function() {
				sap.ui.getCore().byId("idSenha").focus();
			},

			onDialogChecarLoginsButton: function() {
				var that = this;

				function onDialogCancelLoginsButton() {

					if (that._ItemDialog) {
						that._ItemDialog.destroy(true);
					}

				}

				// this.getImei();
				var dataAtualizacao = this.retornaDataAtualizacao();
				var codUsr = sap.ui.getCore().byId("idUsuario").getValue();
				var senha = sap.ui.getCore().byId("idSenha").getValue();
				var werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
				var imeiCelular = this.getOwnerComponent().getModel("modelAux").getProperty("/Imei");
				imeiCelular = "123456";
				var numVersao = that.getOwnerComponent().getModel("modelAux").getProperty("/VersaoApp");

				if (codUsr === "") {
					sap.m.MessageBox.show(
						"Preencher o campo Usuário.", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Campo(s) em branco!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								sap.ui.getCore().byId("idUsuario").focus();

							}
						}
					);
				} else if (senha === "") {
					sap.m.MessageBox.show(
						"Preencher o campo Senha.", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Campo(s) em branco!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								sap.ui.getCore().byId("idSenha").focus();

							}
						}
					);
				} else {

					var oModel = this.getOwnerComponent().getModel("modelAux").getProperty("/DBModel");

					// var oModel = new sap.ui.model.odata.v2.ODataModel("http://104.208.137.3:8000/sap/opu/odata/sap/ZFORCA_VENDAS_VB_SRV/", { 
					// 	json     : true,
					// 	user     : "appadmin",
					// 	password : "sap123"
					// });

					// oModel.setProperty("user", "rcardilo");
					// oModel.setProperty("password", "sap123");

					sap.ui.getCore().byId("idDialogLogin").setBusy(true);

					oModel.read("/Login(IvCodRepres='" + codUsr + "',IvWerks='" + werks + "',IvSenha='" + senha +
						"',IvImei='" + imeiCelular + "',IvVersaoapp='" + numVersao + "')", {
							success: function(retorno) {
								if (retorno.EvRettyp == "E") {

									sap.m.MessageBox.show(
										retorno.EvReturn, {
											icon: sap.m.MessageBox.Icon.WARNING,
											title: "Falha ao realizar Login!",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function(oAction) {
												sap.ui.getCore().byId("idDialogLogin").setBusy(false);

											}
										}
									);

								} else if (retorno.EvRettyp == "S") {

									var open = indexedDB.open("VB_DataBase");

									open.onerror = function(hxr) {
										console.log("Erro ao abrir tabelas.");
										console.log(hxr.Message);
									};

									//Load tables
									open.onsuccess = function(e) {

										var db = e.target.result;

										var objUsuarios = db.transaction(["Usuarios"], "readwrite");
										var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

										var request = objectStoreUsuarios.get(werks);

										request.onsuccess = function(e1) {
											var result = e1.target.result;

											var codRepres = retorno.CodRepres;

											var entryUsuario = {
												// idEmpresa: werks + "." + codRepres,
												werks: werks,
												dataAtualizacao: "", // Deixo em branco, essa info somente sera atualizada no clique do botao atualizar, caso ocorra tudo corretamente
												codUsr: codUsr,
												senha: senha,
												imei: imeiCelular,
												numVersao: numVersao,
												codRepres: codRepres,
												tipousuario: retorno.Tipousuario,
												// Utiliza Campanha Prod Acab
												utilcampProdAcab: retorno.UtilcampAmo == "S",
												//Utiliza Campanha Brinde
												utilcampBri: retorno.UtilcampBri == "S",
												//Utiliza Campanha Enxoval
												utilcampEnxoval: retorno.UtilcampDesc == "S",
												//Utiliza Campanha Prz
												utilcampPrz: retorno.UtilcampPrz == "S",
												//Utiliza Campanha Global
												utilcampGbl: retorno.UtilcampBon == "S",
												utilcomAmo: retorno.UtilcomAmo == "S",
												utilcomBon: retorno.UtilcomBon == "S",
												utilcomBri: retorno.UtilcomBri == "S",
												utilcomDesc: retorno.UtilcomDesc == "S",
												utilcomPrz: retorno.UtilcomPrz == "S",
												utilverbAmo: retorno.UtilverbAmo == "S",
												utilverbBon: retorno.UtilverbBon == "S",
												utilverbBri: retorno.UtilverbBri == "S",
												utilverbDesc: retorno.UtilverbDesc == "S",
												utilverbPrz: retorno.UtilverbPrz == "S",
												buGroup: retorno.BuGroup,
												tabbon: retorno.Tabbon,
												tabamo: retorno.Tabamo,
												tabbri: retorno.Tabbri,
												usrped: retorno.Usrped,
												usrapr: retorno.Usrapr
											};

											if (result == null || result == undefined) {

												var requestUsuariosAdd = objectStoreUsuarios.add(entryUsuario);

												requestUsuariosAdd.onsuccess = function() {

													MessageBox.show(retorno.EvReturn, {
														icon: MessageBox.Icon.SUCCESS,
														title: "Confirmação",
														actions: [MessageBox.Action.OK],
														onClose: function() {

															that.getOwnerComponent().getModel("modelAux").setProperty("/CodRepres", codRepres);
															that.getOwnerComponent().getModel("modelAux").setProperty("/CodUsr", codUsr);
															that.getOwnerComponent().getModel("modelAux").setProperty("/Tipousuario", retorno.Tipousuario);
															sap.ui.getCore().byId("idUsuario").setProperty("enabled", false);
															sap.ui.getCore().byId("idSenha").setProperty("enabled", false);

															if (that._ItemDialog) {
																that._ItemDialog.destroy(true);
															}
														}
													});

												};
												requestUsuariosAdd.onerror = function() {
													console.log("Erro ao adicionar dados de login.");
												};

											} else {
												var requestUsuariosUpdate = objectStoreUsuarios.put(entryUsuario);

												requestUsuariosUpdate.onsuccess = function() {

													MessageBox.show("Login foi Atualizado com Sucesso!", {
														icon: MessageBox.Icon.SUCCESS,
														title: "Confirmação",
														actions: [MessageBox.Action.OK],
														onClose: function() {

															if (that._ItemDialog) {
																that._ItemDialog.destroy(true);
															}
														}
													});
												};
												requestUsuariosUpdate.onerror = function() {
													console.log("Erro ao adicionar dados de login");
												};
											}
										};
									};
								}
							},
							error: function(error) {

								sap.ui.getCore().byId("idDialogLogin").setBusy(false);
								that.onMensagemErroODATA(error.statusCode);

							}
						});
				}
			},

			onDialogCancelLoginsButton: function() {

				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}

			},

			onOpenMudarSenha: function() {
				var that = this;
				var open = indexedDB.open("VB_DataBase");

				open.onerror = function(hxr) {
					console.log("Erro ao abrir tabelas.");
					console.log(hxr.Message);
				};

				open.onsuccess = function(e) {

					var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
					var db = e.target.result;

					var objUsuarios = db.transaction(["Usuarios"], "readwrite");
					var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

					var request = objectStoreUsuarios.get(werks);

					request.onsuccess = function(e) {

						var result = e.target.result;
						if (result !== null && result !== undefined) {

							sap.ui.getCore().byId("idUsuario").setValue(result.codUsr);
							that.getOwnerComponent().getModel("modelAux").setProperty("/CodUsr", result.codUsr);
							that.getOwnerComponent().getModel("modelAux").setProperty("/SenhaAlterar", result.senha);

							if (that._ItemDialog) {
								that._ItemDialog.destroy(true);
							}

							if (!that._CreateMaterialFragment) {
								that._ItemDialog = sap.ui.xmlfragment(
									"testeui5.view.AlterarSenha",
									that
								);
								that.getView().addDependent(that._ItemDialog);
							}
							that._ItemDialog.open();
						} else {
							sap.m.MessageBox.show(
								"Faça a autenticação com Usuário e Senha primeiro!", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Autenticação no sistema!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {

									}
								}
							);
						}
					};
				};
			},

			onFecharAlteracaoSenha: function() {

				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}

				this.onOpenCredenciais();
			},

			onDialogMudarSenha: function() {
				var that = this;
				var senha = sap.ui.getCore().byId("idSenha").getValue();
				var senhaNova = sap.ui.getCore().byId("idSenhaNova").getValue();
				var senhaNova2 = sap.ui.getCore().byId("idSenhaNova2").getValue();
				var codUsuario = this.getOwnerComponent().getModel("modelAux").getProperty("/CodUsr");
				var werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

				if (senhaNova != senhaNova2) {

					sap.m.MessageBox.show(
						"As senhas são diferentes!", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Corrija as Senhas!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								sap.ui.getCore().byId("idSenhaNova").focus();
							}
						}
					);

				} else {

					var oModel = this.getOwnerComponent().getModel("modelAux").getProperty("/DBModel")

					// var oModel = new sap.ui.model.odata.v2.ODataModel("http://104.208.137.3:8000/sap/opu/odata/sap/ZFORCA_VENDAS_VB_SRV/", { 
					// 	json     : true,
					// 	user     : "appadmin",
					// 	password : "sap123"
					// });

					sap.ui.getCore().byId("idDialogAlterarSenha").setBusy(true);

					oModel.read("/MudarSenha(IvCodRepres='" + codUsuario + "',IvWerks='" + werks + "',IvSenha='" + senha + "',IvNovaSenha='" + senhaNova + "')", {
						success: function(retorno) {
							if (retorno.EvRettyp == "E") {

								sap.m.MessageBox.show(
									retorno.EvReturn, {
										icon: sap.m.MessageBox.Icon.WARNING,
										title: "Falha ao atualizar Senha!",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(oAction) {
											sap.ui.getCore().byId("idDialogAlterarSenha").setBusy(false);

										}
									}
								);

							} else if (retorno.EvRettyp == "S") {

								var open = indexedDB.open("VB_DataBase");

								open.onerror = function(hxr) {
									console.log("Erro ao abrir tabelas.");
									console.log(hxr.Message);
								};

								//Load tables
								open.onsuccess = function(e) {

									var db = e.target.result;

									var objUsuarios = db.transaction(["Usuarios"], "readwrite");
									var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

									var request = objectStoreUsuarios.get(werks);

									request.onsuccess = function(e1) {
										var result = e1.target.result;

										if (result != null || result != undefined) {

											result.senha = senhaNova;

											var requestUsuariosAdd = objectStoreUsuarios.put(result);

											requestUsuariosAdd.onsuccess = function() {

												MessageBox.show(retorno.EvReturn, {
													icon: MessageBox.Icon.SUCCESS,
													title: "Confirmação",
													actions: [MessageBox.Action.OK],
													onClose: function() {
														if (that._ItemDialog) {
															that._ItemDialog.destroy(true);
														}
													}
												});

											};
											requestUsuariosAdd.onerror = function() {
												console.log("Erro ao adicionar dados de login.");
											};

										}
									};
								};
							}
						},
						error: function(error) {

							sap.ui.getCore().byId("idDialogAlterarSenha").setBusy(false);
							that.onMensagemErroODATA(error.statusCode);

						}
					});
				}
			},

			onDialogResetarLoginsButton: function() {
				var that = this;

				MessageBox.show("Deseja mesmo resetar as credenciais? Todos os dados serão perdidos. Inclusive pedidos digitados e não enviados!!", {
					icon: MessageBox.Icon.ERROR,
					title: "Cuidado!",
					actions: ["Resetar credenciais", sap.m.MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if (oAction === "Resetar credenciais") {

							// Excluir os valores das tabelas
							var open = indexedDB.open("VB_DataBase");
							open.onerror = function(hxr) {
								console.log("Erro ao abrir tabelas.");
								console.log(hxr.Message);
							};
							//Load tables
							open.onsuccess = function() {
								// Tabelas para serem limpadas
								var vTables = ["Clientes", "A969", "Usuarios", "A959", "A960", "A961", "A962", "A963", "A964", "A965", "A966", "A967", "A968",
									"Materiais", "PrePedidos", "ItensPedido", "TitulosAbertos", "Konm", "EntregaFutura", "EntregaFutura2", "EntregaFutura3", "TiposPedidos", "FormasPagamentos", "CmpPrzMed",
									"StatusPedidos", "CmpGbItensBrindes", "CmpSldBrindes", "CmpProdsAcabs", "CmpGbQtdItens", "CmpGbProdsAcabs", "CmpGbGrpProdsAcabs", "CmpEnxoval", "ControleAmostra", "SaldoVerba"
								];

								that.DropDBTables(vTables);

								sap.ui.getCore().byId("idUsuario").setEnabled(true);
								sap.ui.getCore().byId("idUsuario").setValue("");
								sap.ui.getCore().byId("idSenha").setValue("");

								that.getOwnerComponent().getModel("modelAux").setProperty("/DataAtualizacao", "");
								that.getOwnerComponent().getModel("modelAux").setProperty("/bConectado", false);

								sap.ui.getCore().byId("idUsuario").focus();
							};
						}
					}
				});
			},

			onDialogPromocoesCancelButton: function() {
				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}
			},

			onMensagemErroODATA: function(codigoErro) {
				var that = this;

				if (codigoErro == 0) {
					sap.m.MessageBox.show(
						"Verifique a conexão com a internet!", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Falha na Conexão!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (that._ItemDialog) {
									that._ItemDialog.destroy(true);
								}
							}
						}
					);
				} else if (codigoErro == 400) {
					sap.m.MessageBox.show(
						"Url mal formada! Contate a consultoria!", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Erro no programa Fiori!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (that._ItemDialog) {
									that._ItemDialog.destroy(true);
								}
							}
						}
					);
				} else if (codigoErro == 403) {
					sap.m.MessageBox.show(
						"Usuário sem autorização para executar a função (403)! Contate a consultoria!", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Erro no programa Abap!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (that._ItemDialog) {
									that._ItemDialog.destroy(true);
								}
							}
						}
					);
				} else if (codigoErro == 404) {
					sap.m.MessageBox.show(
						"Função não encontrada e/ou Parâmentros inválidos  (404)! Contate a consultoria!", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Erro no programa Abap!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (that._ItemDialog) {
									that._ItemDialog.destroy(true);
								}
							}
						}
					);
				} else if (codigoErro == 500) {
					sap.m.MessageBox.show(
						"Ocorreu um Erro (500)! Contate a consultoria!", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Erro no programa Abap!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (that._ItemDialog) {
									that._ItemDialog.destroy(true);
								}
							}
						}
					);
				} else if (codigoErro == 501) {
					sap.m.MessageBox.show(
						"Função não implementada (501)! Contate a consultoria!", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Erro no programa Abap!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (that._ItemDialog) {
									that._ItemDialog.destroy(true);
								}
							}
						}
					);
				}
			}
		});
	});