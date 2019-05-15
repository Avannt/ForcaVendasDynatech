/*eslint-disable no-console, no-alert */
/*eslint-disable no-console, sap-no-hardcoded-url */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"testeui5/controller/BaseController",
		"sap/m/MessageBox",
		"testeui5/util/mensagem",
		"testeui5/js/index"
	],
	function (Controller, BaseController, MessageBox, mensagem, index) {
		"use strict";
		var idbSupported = false;
		var ImeiResult = [];

		return BaseController.extend("testeui5.controller.Login", {

			onInit: function () {
				this.getRouter().getRoute("login").attachPatternMatched(this._onLoadFields, this);
			},
			
			getImei: function() {
				var that = this;
				var isTablet = this.getOwnerComponent().getModel("modelAux").getProperty("/isTablet");
				if (device.platform == 'Android') {
					window.plugins.sim.hasReadPermission(successCallback1, errorCallback1);
					window.plugins.sim.requestReadPermission(successCallback2, errorCallback2);

					if (isTablet == true) {
						that.getOwnerComponent().getModel("modelAux").setProperty("/imei", device.uuid);

					} else {
						window.plugins.sim.getSimInfo(successCallback3, errorCallback3);

					}

				} else if (device.platform == 'iOS') {

					that.getOwnerComponent().getModel("modelAux").setProperty("/imei", device.uuid);

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
					imeiResult = result;
					that.getOwnerComponent().getModel("modelAux").setProperty("/imei", imeiResult.deviceId);
				}

				function errorCallback3(error) {
					console.log(error);
				}
			},

			_onLoadFields: function () {
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
					this.getOwnerComponent().getModel("modelAux").setProperty("/VersaoApp", "1.0.3");
					sUrl = "http://34.195.216.197:8080/sap/opu/odata/sap/ZFORCA_VENDAS_SRV/?sap-client=310";

					var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
						json: true,
						user: "rcardilo",
						password: "sap123"
					});

					this.getView().setModel(oModel);
					this.getOwnerComponent().getModel("modelAux").setProperty("/DBModel", oModel);
				} else {
					// QAS
					this.getOwnerComponent().getModel("modelAux").setProperty("/DBModel", this.getView().getModel());
					//Esse parâmetro está cadastrado na tabela tvarv no S4/HANA
					this.getOwnerComponent().getModel("modelAux").setProperty("/VersaoApp", "1.0.3");
				}

				this.getOwnerComponent().getModel("modelAux").setProperty("/Werks", "1100");
				this.getOwnerComponent().getModel("modelAux").setProperty("/EditarIndexItem", 0);

				this.getOwnerComponent().getModel("modelAux").setProperty("/bConectado", false);

				//sap.ui.getCore().byId("label").visible = false;

				if ("indexedDB" in window) {
					idbSupported = true;
				}

				if (idbSupported) {

					var open = indexedDB.open("VB_DataBase", 7);

					// Create the Tables
					open.onupgradeneeded = function (e) {
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
								keyPath: "idCliente",
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

						if (!db.objectStoreNames.contains("FormasPagamentos")) {
							var objFormasPagamentos = db.createObjectStore("FormasPagamentos", {
								keyPath: "idFormasPagamentos",
								unique: true,
								autoIncrement: true
							});
						}

						if (!db.objectStoreNames.contains("A990")) {
							var objA990 = db.createObjectStore("A990", {
								keyPath: "idA990",
								unique: true,
								autoIncrement: true
							});
							
							objA990.createIndex("matnr", "matnr", {
								unique: false
							});
						}

						if (!db.objectStoreNames.contains("A406")) {
							var objA406 = db.createObjectStore("A406", {
								keyPath: "idA406",
								unique: true,
								autoIncrement: true
							});
							
							objA406.createIndex("matnr", "matnr", {
								unique: false
							});
						}

						if (!db.objectStoreNames.contains("A991")) {
							var objA991 = db.createObjectStore("A991", {
								keyPath: "idA991",
								unique: true,
								autoIncrement: true
							});
							
							objA991.createIndex("matnr", "matnr", {
								unique: false
							});
						}
						
						if (!db.objectStoreNames.contains("TabPreco")) {
							var objTabPreco = db.createObjectStore("TabPreco", {
								keyPath: "idTabPreco",
								unique: true,
								autoIncrement: true
							});
						}
						
						if (!db.objectStoreNames.contains("OrdensTabPreco")) {
							var objOrdensTabPreco = db.createObjectStore("OrdensTabPreco", {
								keyPath: "idOrdensTabPreco",
								unique: true,
								autoIncrement: true
							});
							
							objOrdensTabPreco.createIndex("kozgf", "kozgf", {
								unique: false
							});
						}
					};

					open.onerror = function (hxr) {
						console.log("Erro ao abrir tabelas.");
						console.log(hxr.Message);
					};
					//Load tables
					open.onsuccess = function (e) {

						var db = e.target.result;
						var Werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

						var tx = db.transaction("Usuarios", "readwrite");
						var objUsuarios = tx.objectStore("Usuarios");

						var request = objUsuarios.get(Werks);

						request.onsuccess = function (evt) {

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

			onInicializaModels: function () {

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

			retornaDataAtualizacao: function () {
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

			getPermissao: function () {
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

			getImei: function () {
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

			onLoadTables: function () {

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

				open.onsuccess = function () {
					var db = open.result;

					var store = db.transaction("PrePedidos").objectStore("PrePedidos");
					var indiceStatusPed = store.index("idStatusPedido");

					var request = indiceStatusPed.getAll(2); // 2 -> Status Pendente (envio)

					var oDocsPendentes = [];
					request.onsuccess = function (event) {
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
								onClose: function () {
									bExisteDocPendente = false;
									return;
								}
							});
					}

					MessageBox.show("Você deseja atualizar as tabelas?", {
						icon: MessageBox.Icon.QUESTION,
						title: "Atualização das tabelas.",
						actions: [MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.YES) {

								var vTables = ["Clientes", "Materiais", "PrePedidos", "StatusPedidos", "OrdensTabPreco",
									"ItensPedido", "TitulosAbertos", "TiposPedidos", "FormasPagamentos", "A991", "A406", "A990", "TabPreco"
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

								request.onsuccess = function (e1) {

									var result1 = e1.target.result;

									if (result1 !== null && result1 !== undefined) {

										oModel.read("/Login(IvRepres='" + result1.codUsr + "',IvWerks='" + Werks + "',IvSenha='" +
											result1.senha + "',IvVersaoapp='" + NumVersao + "')", {
												success: function (retorno) {
													if (retorno.EvRettyp == "E") {

														sap.m.MessageBox.show(
															retorno.EvReturn, {
																icon: sap.m.MessageBox.Icon.WARNING,
																title: "Falha ao realizar Login!",
																actions: [sap.m.MessageBox.Action.OK],
																onClose: function (oAction) {
																	if (that._ItemDialog) {
																		that._ItemDialog.destroy(true);
																	}
																}
															}
														);

													} else if (retorno.EvRettyp == "S") {

														//Clientes
														oModel.read("/Clientes", {
															urlParameters: {
																"$filter": "IvRepres eq '" + CodRepres + "'"
															},
															success: function (retornoCliente) {

																var txCliente = db.transaction("Clientes", "readwrite");
																var objCliente = txCliente.objectStore("Clientes");

																for (var i = 0; i < retornoCliente.results.length; i++) {
																	
																	var objBancoCliente = {
																		idCliente: retornoCliente.results[i].Kunnr + "." + retornoCliente.results[i].Vkorg 
																			+ "." + retornoCliente.results[i].Vtweg + "." + retornoCliente.results[i].Spart,
																		kunnr: retornoCliente.results[i].Kunnr,
																		vkorg: retornoCliente.results[i].Vkorg,
																		vtweg: retornoCliente.results[i].Vtweg,
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
																		inco1: retornoCliente.results[i].Inco1,
																		parvw: retornoCliente.results[i].Parvw,
																		lifnr: retornoCliente.results[i].Lifnr,
																		telf1: retornoCliente.results[i].Telf1,
																		spart: retornoCliente.results[i].Spart
																	};
																	
																// for (var i = 0; i < 3; i++) {
																		// kunnr: String(parseInt("100010", 10) + i),
																		// land1: "BR",
																		// lifnr: "203453",
																		// name1: "PAULO SERGIO MONTEIRO BORGES",
																		// name2: "",
																		// ort01: "CAMPO VERDE",
																		// ort02: "CENTRO",
																		// parvw: "YR",
																		// pstlz: "78840-000",
																		// regio: "MT",
																		// stcd1: "",
																		// stcd2: "53636309153",
																		// stras: "AV CURITIBA, 411 411",
																		// telf1: "6634195164",
																		// spart: 10*i,
																		// vkorg: "1100",
																		// vtweg: "AG"
																		

																	var requestCliente = objCliente.add(objBancoCliente);

																	requestCliente.onsuccess = function (event) {
																		console.log("Dados Clientes inseridos");
																	};
																	requestCliente.onerror = function (event) {
																		console.log("Dados Clientes não foram inseridos :" + event);
																	};
																}

																oModel.read("/TiposPedidos", {
																	success: function (retornoTiposPedidos) {

																		var txTiposPedidos = db.transaction("TiposPedidos", "readwrite");
																		var objTiposPedidos = txTiposPedidos.objectStore("TiposPedidos");

																		// for (i = 0; i < retornoTiposPedidos.results.length; i++) {
																		for (i = 0; i < 1; i++) {

																			// var objBancoTiposPedidos = {
																			// 	idTipoPedido: "retornoTiposPedidos.results[i].Auart",
																			// 	descricao: retornoTiposPedidos.results[i].Bezei
																			// };
																			var objBancoTiposPedidos = {
																				idTipoPedido: "YVEN",
																				descricao: "Pedido de Venda"
																			};

																			var requestTiposPedidos = objTiposPedidos.add(objBancoTiposPedidos);

																			requestTiposPedidos.onsuccess = function (event) {
																				console.log("Dados TiposPedidos inseridos");
																			};
																			requestTiposPedidos.onerror = function (event) {
																				console.log("Dados TiposPedidos não foram inseridos :" + event);
																			};
																		}

																		oModel.read("/Materiais", {
																			success: function (retornoMateriais) {

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

																					requestMateriais.onsuccess = function (event) {
																						console.log("Dados Materiais inseridos. " + event);
																					};

																					requestMateriais.onerror = function (event) {
																						console.log("Dados Materiais não foram inseridos :" + event);
																					};
																				}

																				oModel.read("/FormasPagamentos", {
																					// urlParameters: {
																					// 	"$filter": "IvCodRepres eq '" + CodRepres + "'"
																					// },
																					success: function (retornoFormasPagamentos) {
																						var txFormasPagamentos = db.transaction("FormasPagamentos", "readwrite");
																						var objFormasPagamentos = txFormasPagamentos.objectStore("FormasPagamentos");

																						for (i = 0; i < retornoFormasPagamentos.results.length; i++) {

																							var objBancoFormasPagamentos = {
																								idFormasPagamentos: i,
																								zlsch: retornoFormasPagamentos.results[i].Zlsch,
																								text1: retornoFormasPagamentos.results[i].Text1
																							};

																							var requestFormasPagamentos = objFormasPagamentos.put(objBancoFormasPagamentos);

																							requestFormasPagamentos.onsuccess = function (event) {
																								console.log("Dados FormasPagamentos inseridos. " + event);
																							};

																							requestFormasPagamentos.onerror = function (event) {
																								console.log("Dados FormasPagamentos não foram inseridos :" + event);
																							};
																						}
																						
																						/*
																							KAPPL	1 Tipo	KAPPL	CHAR	2	0	Aplicação
																							KSCHL	1 Tipo	KSCHA	CHAR	4	0	Tipo de condição
																							WERKS	1 Tipo	WERKS_D	CHAR	4	0	Centro
																							MATNR	1 Tipo	MATNR	CHAR	40	0	Nº do material
																							KBETR	1 Tipo	KBETR_KOND	CURR	11	2	Montante/porcentagem de condição no caso de não haver escala
																							SPART	1 Tipo	SPART	CHAR	2	0	Setor de atividade
																						*/
																						oModel.read("/A991", {
																							success: function (retornoA991) {
																								var txA991 = db.transaction("A991", "readwrite");
																								var objA991 = txA991.objectStore("A991");

																								for (i = 0; i < retornoA991.results.length; i++) {

																									var objBancoA991 = {
																										idA991: i,
																										kappl: retornoA991.results[i].Kappl,
																										kschl: retornoA991.results[i].Kschl,
																										werks: retornoA991.results[i].Werks,
																										matnr: retornoA991.results[i].Matnr,
																										kbetr: retornoA991.results[i].Kbetr,
																										spart: retornoA991.results[i].Spart
																									};

																									var requestA991 = objA991.put(objBancoA991);
																									
																									requestA991.onsuccess = function (event) {
																										console.log("Dados A991 inseridos. " + event);
																									};

																									requestA991.onerror = function (event) {
																										console.log("Dados A991 não foram inseridos :" + event);
																									};
																								}
																								
																								/*
																									KAPPL	1 Tipo	KAPPL	CHAR	2	0	Aplicação
																									KSCHL	1 Tipo	KSCHA	CHAR	4	0	Tipo de condição
																									WERKS	1 Tipo	WERKS_D	CHAR	4	0	Centro
																									KUNNR	1 Tipo	KUNNR	CHAR	10	0	Nº cliente
																									MATNR	1 Tipo	MATNR	CHAR	40	0	Nº do material
																									KBETR	1 Tipo	KBETR_KOND	CURR	11	2	Montante/porcentagem de condição no caso de não haver escala
																								*/
																								
																								oModel.read("/A990", {
																									success: function (retornoA990) {
																										var txA990 = db.transaction("A990", "readwrite");
																										var objA990 = txA990.objectStore("A990");

																										for (i = 0; i < retornoA990.results.length; i++) {

																											var objBancoA990 = {
																												idA990: i,
																												kappl: retornoA990.results[i].Kappl,
																												kschl: retornoA990.results[i].Kschl,
																												werks: retornoA990.results[i].Werks,
																												matnr: retornoA990.results[i].Matnr,
																												kbetr: retornoA990.results[i].Kbetr,
																												kunnr: retornoA990.results[i].Kunnr
																											};

																											var requestA990 = objA990.put(objBancoA990);

																											requestA990.onsuccess = function (event) {
																												console.log("Dados A990 inseridos. " + event);
																											};

																											requestA990.onerror = function (event) {
																												console.log("Dados A990 não foram inseridos :" + event);
																											};
																										}
																										
																										/*
																											KAPPL	1 Tipo	KAPPL	CHAR	2	0	Aplicação
																											KSCHL	1 Tipo	KSCHA	CHAR	4	0	Tipo de condição
																											WERKS	1 Tipo	WERKS_D	CHAR	4	0	Centro
																											MATNR	1 Tipo	MATNR	CHAR	40	0	Nº do material
																											KBETR	1 Tipo	KBETR_KOND	CURR	11	2	Montante/porcentagem de condição no caso de não haver escala
																										*/
																										
																										oModel.read("/A406", {
																											success: function (retornoA406) {
																												var txA406 = db.transaction("A406", "readwrite");
																												var objA406 = txA406.objectStore("A406");
		
																												for (i = 0; i < retornoA406.results.length; i++) {
		
																													var objBancoA406 = {
																														idA406: i,
																														kappl: retornoA406.results[i].Kappl,
																														kschl: retornoA406.results[i].Kschl,
																														werks: retornoA406.results[i].Werks,
																														matnr: retornoA406.results[i].Matnr,
																														kbetr: retornoA406.results[i].Kbetr
																													};
		
																													var requestA406 = objA406.put(objBancoA406);
		
																													requestA406.onsuccess = function (event) {
																														console.log("Dados A406 inseridos. " + event);
																													};
		
																													requestA406.onerror = function (event) {
																														console.log("Dados A406 não foram inseridos :" + event);
																													};
																												}
																												/*
																													KOZGF	1 Tipo	KOZGF	CHAR	4	0	Seqüência de acesso
																													KOLNR	1 Tipo	KOLNR	NUMC	3	0	Seqüência de acesso - acesso
																													KOTABNR	1 Tipo	KOTABNR	CHAR	3	0	Tabela de condições
																												*/
																												
																												oModel.read("/OrdensTabPreco", {
																													success: function (retornoOrdensTabPreco) {
																														var txOrdensTabPreco = db.transaction("OrdensTabPreco", "readwrite");
																														var objOrdensTabPreco = txOrdensTabPreco.objectStore("OrdensTabPreco");
				
																														for (i = 0; i < retornoOrdensTabPreco.results.length; i++) {
				
																															var objBancoOrdensTabPreco = {
																																idOrdensTabPreco: i,
																																kozgf: retornoOrdensTabPreco.results[i].Kozgf,
																																kolnr: retornoOrdensTabPreco.results[i].Kolnr,
																																kotabnr: retornoOrdensTabPreco.results[i].Kotabnr
																															};
				
																															var requestOrdensTabPreco = objOrdensTabPreco.put(objBancoOrdensTabPreco);
				
																															requestOrdensTabPreco.onsuccess = function (event) {
																																console.log("Dados OrdensTabPreco inseridos. " + event);
																															};
				
																															requestOrdensTabPreco.onerror = function (event) {
																																console.log("Dados OrdensTabPreco não foram inseridos :" + event);
																															};
																														}
																														
																														var txTabPreco = db.transaction("TabPreco", "readwrite");
																														var objTabPreco = txTabPreco.objectStore("TabPreco");
																														
																														//Tab preço
																														for (i = 0; i < 2; i++) {
				
																															var objBancoTabPreco = {
																																idTabPreco: i,
																																pltyp: "Z" + (parseInt(i,10)+1),
																																ptext: "Tabela de preço padrão" + (parseInt(i,10)+1)																															};
				
																															var requestTabPreco = objTabPreco.put(objBancoTabPreco);
				
																															requestTabPreco.onsuccess = function (event) {
																																console.log("Dados TabPreco inseridos. " + event);
																															};
				
																															requestTabPreco.onerror = function (event) {
																																console.log("Dados TabPreco não foram inseridos :" + event);
																															};
																														}
																														
																													MessageBox.show(
																														"Tabelas carregadas com sucesso!", {
																															icon: MessageBox.Icon.SUCCESS,
																															title: "Carregamento Completo",
																															actions: [MessageBox.Action.OK],
																															onClose: function () {
																																if (that._ItemDialog) {
																																	that._ItemDialog.destroy(true);
																																}
																																that.onUpdateDateTime();
																															}
																														});
																												},
																												error: function (error) {
																													console.log(error);
																													that.onMensagemErroODATA(error.statusCode);
																												}
																											});
																											},
																											error: function (error) {
																												console.log(error);
																												that.onMensagemErroODATA(error.statusCode);
																											}
																										});
																									},
																									error: function (error) {
																										console.log(error);
																										that.onMensagemErroODATA(error.statusCode);
																									}
																								});
																							},
																							error: function (error) {
																								console.log(error);
																								that.onMensagemErroODATA(error.statusCode);
																							}
																						});
																					},
																					error: function (error) {
																						console.log(error);
																						that.onMensagemErroODATA(error.statusCode);
																					}
																				});
																			},
																			error: function (error) {
																				console.log(error);
																				that.onMensagemErroODATA(error.statusCode);
																			}
																		});
																	},
																	error: function (error) {
																		console.log(error);
																		that.onMensagemErroODATA(error.statusCode);
																	}
																});
															},
															error: function (error) {
																console.log(error);
																that.onMensagemErroODATA(error.statusCode);
															}
														});
													}
												},
												error: function (error) {
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
												onClose: function () {
													that._ItemDialog.close();
												}
											});
									}
								};
								request.onerror = function (ex) {
									console.log(ex);
									console.log("Não foi possivel encontrar o registro na tabela de usuários");
								};
							}
						}
					});
				};
				/*-------------------------------------------------------------------------------------------------*/
			},

			onAfterRendering: function () {

			},

			DropDBTables: function (vTables) {
				var open = indexedDB.open("VB_DataBase");

				open.onerror = function (e) {
					console.log("Erro ao abrir conexão.");
					console.log(e.Message);
				};

				open.onsuccess = function (e) {
					var db = e.target.result;

					for (var i = 0; i <= vTables.length - 1; i++) {
						var sTableName = vTables[i];

						var transaction = db.transaction(sTableName, "readwrite");
						var objectStore = transaction.objectStore(sTableName);
						var objectStoreRequest = objectStore.clear();

						objectStoreRequest.onsuccess = function (event) {
							console.log("Dados da tabela " + sTableName + " removidos com sucesso");
						};
						objectStoreRequest.onerror = function (event) {
							console.log("Erro ao limpar tabela " + sTableName);
						};

					}
				};
			},

			onBusyDialogClosed: function () {

				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}
			},

			onBusyDialogClosed2: function () {

				if (this._ItemDialog2) {
					this._ItemDialog2.destroy(true);
				}
			},

			onBusyDialogClosed3: function () {

				if (this._ItemDialog3) {
					this._ItemDialog3.destroy(true);
				}
			},

			onStartWorking: function () {
				var that = this;
				var open = indexedDB.open("VB_DataBase");

				open.onerror = function (hxr) {
					console.log("Erro ao abrir tabelas.");
					console.log(hxr.Message);
				};

				open.onsuccess = function (e) {
					var db = e.target.result;
					var tx = db.transaction("Usuarios", "readwrite");
					var objUsuarios = tx.objectStore("Usuarios");
					var Werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

					var request = objUsuarios.get(Werks);

					/* Verifico se existe a tabela de Usuários.*/
					request.onsuccess = function (e1) {
						var result1 = e1.target.result;

						if (result1 == undefined) {
							MessageBox.show(
								"Por Favor atualize o banco de dados para conectar no sistema.", {
									icon: MessageBox.Icon.ERROR,
									title: "Banco de dados desatualizado",
									actions: [MessageBox.Action.OK],
									onClose: function () {
										return;
									}
								});
						}

						that.getOwnerComponent().getModel("modelAux").setProperty("/Usuario", result1);
						var oPrincipal = that.getView().getModel("menu").getProperty("/Principal");

						var bAtualizarTabelas = false;

						var sData = result1.dataAtualizacao;
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
									onClose: function () {}
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
									onClose: function () {
										that._ItemDialog.close();
									}
								});
						}
					};
				};
			},

			onEnviarDocs: function () {
				var that = this;

				var open = indexedDB.open("VB_DataBase");

				open.onerror = function (hxr) {
					console.log("Erro ao abrir tabelas.");
					console.log(hxr.Message);
				};

				open.onsuccess = function (e) {
					var db = e.target.result;
					var tx = db.transaction("Usuarios", "readwrite");
					var objUsuarios = tx.objectStore("Usuarios");
					var Werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

					var request = objUsuarios.get(Werks);

					/* Verifico se existe a tabela de Usuários.*/
					request.onsuccess = function (e1) {
						var result1 = e1.target.result;

						if (result1 == undefined) {

							MessageBox.show(
								"Por Favor atualize o banco de dados para conectar no sistema.", {
									icon: MessageBox.Icon.ERROR,
									title: "Banco de dados desatualizado",
									actions: [MessageBox.Action.OK],
									onClose: function () {
										return;
									}
								});

						} else {

							that.getOwnerComponent().getModel("modelAux").setProperty("/Usuario", result1);

							sap.m.MessageBox.warning(
								"Deseja entrar no envio de pedidos?", {
									title: "Envio de documentos",
									actions: ["OK", sap.m.MessageBox.Action.CANCEL],
									onClose: function (sAction) {
										switch (sAction) {
										case "OK":
											// that.getOwnerComponent().getModel("modelAux").setProperty("/bEnviarPedido", true);
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
			onOpenCredenciais: function () {

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

				open.onerror = function (hxr) {
					console.log("Erro ao abrir tabelas.");
					console.log(hxr.Message);
				};

				open.onsuccess = function (e) {

					var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
					var db = e.target.result;

					var objUsuarios = db.transaction(["Usuarios"], "readwrite");
					var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

					var request = objectStoreUsuarios.get(werks);

					request.onsuccess = function (e) {

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

			onUpdateDateTime: function () {
				var that = this;
				var open = indexedDB.open("VB_DataBase");
				var Werks = this.getOwnerComponent().getModel("modelAux").getProperty("/Werks");

				open.onsuccess = function (e) {
					var db = e.target.result;

					var objUsuarios = db.transaction(["Usuarios"], "readwrite");
					var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

					var request = objectStoreUsuarios.get(Werks);

					request.onsuccess = function (e) {
						var data = e.target.result;

						data.dataAtualizacao = that.retornaDataAtualizacao();
						var requestUpdate = objectStoreUsuarios.put(data);

						requestUpdate.onsuccess = function () {
							console.log("Data de atualização das tabelas atualizada");

							that.getOwnerComponent().getModel("modelAux").setProperty("/DataAtualizacao", data.dataAtualizacao);
						};

						requestUpdate.onerror = function () {
							console.log("Erro ao atualizar campo data de atualização no banco.");
						};
					};
				};
			},

			onLoginChange: function () {
				sap.ui.getCore().byId("idSenha").focus();
			},

			onDialogChecarLoginsButton: function () {
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
							onClose: function (oAction) {
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
							onClose: function (oAction) {
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

					oModel.read("/Login(IvRepres='" + codUsr + "',IvWerks='" + werks + "',IvSenha='" +
						senha + "',IvVersaoapp='" + numVersao + "')", {
							success: function (retorno) {
								if (retorno.EvRettyp == "E") {

									sap.m.MessageBox.show(
										retorno.EvReturn, {
											icon: sap.m.MessageBox.Icon.WARNING,
											title: "Falha ao realizar Login!",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (oAction) {
												sap.ui.getCore().byId("idDialogLogin").setBusy(false);

											}
										}
									);

								} else if (retorno.EvRettyp == "S") {

									var open = indexedDB.open("VB_DataBase");

									open.onerror = function (hxr) {
										console.log("Erro ao abrir tabelas.");
										console.log(hxr.Message);
									};

									//Load tables
									open.onsuccess = function (e) {

										var db = e.target.result;

										var objUsuarios = db.transaction(["Usuarios"], "readwrite");
										var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

										var request = objectStoreUsuarios.get(werks);

										request.onsuccess = function (e1) {
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
												tipousuario: retorno.Tipousuario
											};

											if (result == null || result == undefined) {

												var requestUsuariosAdd = objectStoreUsuarios.add(entryUsuario);

												requestUsuariosAdd.onsuccess = function () {

													MessageBox.show(retorno.EvReturn, {
														icon: MessageBox.Icon.SUCCESS,
														title: "Confirmação",
														actions: [MessageBox.Action.OK],
														onClose: function () {

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
												requestUsuariosAdd.onerror = function () {
													console.log("Erro ao adicionar dados de login.");
												};

											} else {
												var requestUsuariosUpdate = objectStoreUsuarios.put(entryUsuario);

												requestUsuariosUpdate.onsuccess = function () {

													MessageBox.show("Login foi Atualizado com Sucesso!", {
														icon: MessageBox.Icon.SUCCESS,
														title: "Confirmação",
														actions: [MessageBox.Action.OK],
														onClose: function () {

															if (that._ItemDialog) {
																that._ItemDialog.destroy(true);
															}
														}
													});
												};
												requestUsuariosUpdate.onerror = function () {
													console.log("Erro ao adicionar dados de login");
												};
											}
										};
									};
								}
							},
							error: function (error) {

								sap.ui.getCore().byId("idDialogLogin").setBusy(false);
								that.onMensagemErroODATA(error.statusCode);

							}
						});
				}
			},

			onDialogCancelLoginsButton: function () {

				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}

			},

			onOpenMudarSenha: function () {
				var that = this;
				var open = indexedDB.open("VB_DataBase");

				open.onerror = function (hxr) {
					console.log("Erro ao abrir tabelas.");
					console.log(hxr.Message);
				};

				open.onsuccess = function (e) {

					var werks = that.getOwnerComponent().getModel("modelAux").getProperty("/Werks");
					var db = e.target.result;

					var objUsuarios = db.transaction(["Usuarios"], "readwrite");
					var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

					var request = objectStoreUsuarios.get(werks);

					request.onsuccess = function (e) {

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
									onClose: function (oAction) {

									}
								}
							);
						}
					};
				};
			},

			onFecharAlteracaoSenha: function () {

				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}

				this.onOpenCredenciais();
			},

			onDialogMudarSenha: function () {
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
							onClose: function (oAction) {
								sap.ui.getCore().byId("idSenhaNova").focus();
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

					sap.ui.getCore().byId("idDialogAlterarSenha").setBusy(true);

					oModel.read("/MudarSenha(IvCodRepres='" + codUsuario + "',IvWerks='" + werks + "',IvSenha='" + senha + "',IvNovaSenha='" +
						senhaNova + "')", {
							success: function (retorno) {
								if (retorno.EvRettyp == "E") {

									sap.m.MessageBox.show(
										retorno.EvReturn, {
											icon: sap.m.MessageBox.Icon.WARNING,
											title: "Falha ao atualizar Senha!",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (oAction) {
												sap.ui.getCore().byId("idDialogAlterarSenha").setBusy(false);

											}
										}
									);

								} else if (retorno.EvRettyp == "S") {

									var open = indexedDB.open("VB_DataBase");

									open.onerror = function (hxr) {
										console.log("Erro ao abrir tabelas.");
										console.log(hxr.Message);
									};

									//Load tables
									open.onsuccess = function (e) {

										var db = e.target.result;

										var objUsuarios = db.transaction(["Usuarios"], "readwrite");
										var objectStoreUsuarios = objUsuarios.objectStore("Usuarios");

										var request = objectStoreUsuarios.get(werks);

										request.onsuccess = function (e1) {
											var result = e1.target.result;

											if (result != null || result != undefined) {

												result.senha = senhaNova;

												var requestUsuariosAdd = objectStoreUsuarios.put(result);

												requestUsuariosAdd.onsuccess = function () {

													MessageBox.show(retorno.EvReturn, {
														icon: MessageBox.Icon.SUCCESS,
														title: "Confirmação",
														actions: [MessageBox.Action.OK],
														onClose: function () {
															if (that._ItemDialog) {
																that._ItemDialog.destroy(true);
															}
														}
													});

												};
												requestUsuariosAdd.onerror = function () {
													console.log("Erro ao adicionar dados de login.");
												};

											}
										};
									};
								}
							},
							error: function (error) {

								sap.ui.getCore().byId("idDialogAlterarSenha").setBusy(false);
								that.onMensagemErroODATA(error.statusCode);

							}
						});
				}
			},

			onDialogResetarLoginsButton: function () {
				var that = this;

				MessageBox.show("Deseja mesmo resetar as credenciais? Todos os dados serão perdidos. Inclusive pedidos digitados e não enviados!!", {
					icon: MessageBox.Icon.ERROR,
					title: "Cuidado!",
					actions: ["Resetar credenciais", sap.m.MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if (oAction === "Resetar credenciais") {

							// Excluir os valores das tabelas
							var open = indexedDB.open("VB_DataBase");
							open.onerror = function (hxr) {
								console.log("Erro ao abrir tabelas.");
								console.log(hxr.Message);
							};
							//Load tables
							open.onsuccess = function () {
								// Tabelas para serem limpadas
								var vTables = ["Clientes", "Usuarios", "Materiais", "PrePedidos", "StatusPedidos", "OrdensTabPreco",
									"ItensPedido", "TitulosAbertos", "TiposPedidos", "FormasPagamentos", "A991", "A406", "A990", "TabPreco"
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

			onDialogPromocoesCancelButton: function () {
				if (this._ItemDialog) {
					this._ItemDialog.destroy(true);
				}
			},

			onMensagemErroODATA: function (codigoErro) {
				var that = this;

				if (codigoErro == 0) {
					sap.m.MessageBox.show(
						"Verifique a conexão com a internet!", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Falha na Conexão!",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
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
							onClose: function (oAction) {
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
							onClose: function (oAction) {
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
							onClose: function (oAction) {
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
							onClose: function (oAction) {
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
							onClose: function (oAction) {
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