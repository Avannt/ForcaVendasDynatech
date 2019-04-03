/*eslint-disable no-console, no-alert */
/*eslint-disable no-console, sap-no-localstorage */

sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function(BaseController, Filter, FilterOperator, MessageBox) {
	"use strict";
	var oPedidosEnviar = [];
	var oItensPedidoGrid = [];
	var oPedidoGrid = [];
	var oItensPedidoEnviar = [];
	var oItensPedidoGridEnviar = [];
	var deletarMovimentos = [];
	var ajaxCall;
	var envioPedidos;

	return BaseController.extend("testeui5.controller.enviarPedidos", {

		onInit: function() {
			this.getRouter().getRoute("enviarPedidos").attachPatternMatched(this._onLoadFields, this);
		},

		_onLoadFields: function() {
			var that = this;
			oPedidosEnviar = [];
			oItensPedidoGrid = [];
			oPedidoGrid = [];
			oItensPedidoEnviar = [];
			oItensPedidoGridEnviar = [];
			//Se for true mostrar a grid de envio de pedidos, senão mostrar a grid de entrega futura.
			envioPedidos = that.getOwnerComponent().getModel("modelAux").getProperty("/bEnviarPedido");

			that.byId("table_pedidos").setVisible(envioPedidos);
			that.byId("btnEnviarPedido").setVisible(envioPedidos);
			that.byId("btnExcluir").setVisible(!envioPedidos);
			that.byId("btnExcluirPedido").setVisible(envioPedidos);

			if (envioPedidos) {

				this.onLoadPedidos();
			} else {

				this.onLoadEntregas();
			}
		},
		/*FIM _onLoadFields*/

		onItemPressEF: function(oEvent) {
			var that = this;
			var oEvItemPressed = oEvent;
			var oBd = oEvItemPressed.getParameter("listItem") || oEvent.getSource();
			var sKunrg = oBd.getBindingContext("EntregasEnviar").getProperty("Kunrg");

			MessageBox.show("Deseja abrir o item selecionado?", {
				icon: MessageBox.Icon.WARNING,
				title: "Editar",
				actions: ["Sim", "Cancelar"],
				onClose: function(oAction) {
					if (oAction == "Sim") {
						/* Gravo no ModelAux a propriedade Kunrg (Cod cliente) para receber lá na tela de entrega futura e 
						selecionar o cliente automaticamente. */
						that.getOwnerComponent().getModel("modelAux").setProperty("/KunrgEntrega", sKunrg);
						sap.ui.core.UIComponent.getRouterFor(that).navTo("entregaFutura");
					}
				}
			});
		},
		/* onItemPressEF */

		onLoadPedidos: function() {
			var open = indexedDB.open("VB_DataBase");
			var that = this;

			open.onerror = function() {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;

				var store = db.transaction("PrePedidos").objectStore("PrePedidos");
				var indiceStatusPed = store.index("idStatusPedido");

				var request = indiceStatusPed.getAll(2);

				request.onsuccess = function(event) {
					oPedidoGrid = event.target.result;

					var vetorPromise = [];

					/* Recupero todos os pedidos pendentes de preposto (9)*/
					store = db.transaction("PrePedidos").objectStore("PrePedidos");
					indiceStatusPed = store.index("idStatusPedido");

					request = indiceStatusPed.getAll(9);
					request.onsuccess = function(event) {
						var oPedidoGrid2 = event.target.result;

						/* Verifico se já existem registros de pedidos de representante (status=2) */
						if (oPedidoGrid == undefined || oPedidoGrid.length == 0) {
							/* Caso não tenha, considero somente os pedidos de prepostos */
							oPedidoGrid = event.target.result;
						} else {
							/* Caso exista pedidos de representantes, necessito verificar se existe pedidos de prepostos.*/
							if (!(oPedidoGrid2 == undefined || oPedidoGrid2 == 0)) {

								/* Se existir, necessito acrescentar 1 a 1 nos pedidos de representantes */
								for (var k = 0; k < oPedidoGrid2.length; k++) {
									oPedidoGrid.push(oPedidoGrid2[k]);
								}
							}
						}

						var oModel = new sap.ui.model.json.JSONModel(oPedidoGrid);
						that.getView().setModel(oModel, "PedidosEnviar");

						for (var j = 0; j < oPedidoGrid.length; j++) {

							vetorPromise.push(new Promise(function(resolve, reject) {
								var storeItensPed = db.transaction("ItensPedido").objectStore("ItensPedido");
								var indiceNrPed = storeItensPed.index("nrPedCli");

								request = indiceNrPed.getAll(oPedidoGrid[j].nrPedCli);

								request.onsuccess = function(event) {

									for (var i = 0; i < event.target.result.length; i++) {
										var aux = event.target.result[i];
										oItensPedidoGrid.push(aux);
									}

									console.log("Pedidos: ");
									console.log(oItensPedidoGrid);
									resolve();
								};

								request.onerror = function(event) {
									console.error(event.error.mensage);
									reject();
								};
							}));
						}
					};

					Promise.all(vetorPromise).then(function(values) {
						console.log("Itens Pedido: ");
						console.log(oItensPedidoGrid);
					});

				};
			};

		},
		/*FIM onLoadPedidos*/

		onLoadEntregas: function() {
			this.byId("table_entregas").setBusy(true);

			var that = this;
			var oModel = new sap.ui.model.json.JSONModel();
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

				var store = db.transaction("EntregaFutura2").objectStore("EntregaFutura2");
				var ixEF2 = store.index("Vbeln");
				var request = ixEF2.openCursor(undefined, "nextunique");

				var oPedidosGrid = [];

				request.onsuccess = function(event) {
					oPedidoGrid = event.target.result;

					if (oPedidoGrid) {
						oPedidosGrid.push(oPedidoGrid.value);

						oPedidoGrid.continue();
					} else {
						oModel = new sap.ui.model.json.JSONModel(oPedidosGrid);
						that.getOwnerComponent().setModel(oModel, "EntregasEnviar");

						that.byId("table_entregas").setBusy(false);
					}
				};
			};
		},
		/*FIM onLoadEntregas*/

		onItemChange: function(oEvent) {

			var sValue = oEvent.getSource().getValue();
			var aFilters = [];
			var oFilter = [
				new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("NameOrg1", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Nrpedcli", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("AprovadoDesc", sap.ui.model.FilterOperator.Contains, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("table_relatorio_pedidos").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

		},

		onNavBack: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("login");
		},
		/*FIM onNavBack*/

		myFormatterDataImp: function(value) {
			if (value !== undefined && value !== null && value !== "" && value !== 0) {
				var data = value.split("-");

				var aux = data[0].split("/");
				var hora = data[1].split(":");
				// var aux2 = aux[2].substring(2, aux[2].length);
				// value = aux[0] + "/" + aux[1] + "/" + aux2;
				value = aux[0] + "/" + aux[1] + "-" + hora[0] + ":" + hora[1];
				return value;
			}
		},
		/*FIM myFormatterDataImp*/

		onItemPress: function(oEvent) {
			var that = this;
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			var nrPedCli = oItem.getBindingContext("PedidosEnviar").getProperty("nrPedCli");
			var variavelCodigoCliente = oItem.getBindingContext("PedidosEnviar").getProperty("kunnr");
			that.getOwnerComponent().getModel("modelAux").setProperty("/Kunnr", variavelCodigoCliente);
			that.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", nrPedCli);

			MessageBox.show("Deseja mesmo detalhar o Pedido? O pedido será reaberto.", {
				icon: MessageBox.Icon.WARNING,
				title: "Detalhamento Solicitado",
				actions: [MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
				onClose: function(oAction) {
					if (oAction == sap.m.MessageBox.Action.YES) {
						var open = indexedDB.open("VB_DataBase");

						open.onerror = function() {
							console.log("não foi possivel encontrar e/ou carregar a base de clientes");
						};

						open.onsuccess = function(e) {
							var db = e.target.result;

							var promise = new Promise(function(resolve, reject) {
								that.carregaModelCliente(db, resolve, reject);
							});

							promise.then(function() {
								/* Reabro o pedido */
								new Promise(function(resAP, rejAP) {
									var store1 = db.transaction("PrePedidos", "readwrite");
									var objPedido = store1.objectStore("PrePedidos");
									var req = objPedido.get(nrPedCli);

									req.onsuccess = function(ret) {
										var result = ret.target.result;
										var oPed = result;
										oPed.idStatusPedido = 1; // Em digitação
										oPed.situacaoPedido = "EM DIGITAÇÃO";

										store1 = db.transaction("PrePedidos", "readwrite");
										objPedido = store1.objectStore("PrePedidos");
										req = objPedido.put(oPed);

										req.onsuccess = function() {
											/* Pedido reaberto */
											resAP();
											console.log("O pedido foi reaberto.");
										};

										req.onerror = function() {
											/* Erro ao reabir pedido */
											rejAP("Erro ao reabrir pedido!");
											console.log("Erro ao abrir o Pedido > " + nrPedCli);
										};
									};
								}).then(function() {
									sap.ui.core.UIComponent.getRouterFor(that).navTo("pedidoDetalhe");
								});
							});
						};
					}
				}
			});
		},
		/*FIM onItemPress*/

		carregaModelCliente: function(db, resolve, reject) {
			var that = this;

			var codCliente = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");

			var tx = db.transaction("Clientes", "readwrite");
			var objUsuarios = tx.objectStore("Clientes");

			var request = objUsuarios.get(codCliente);

			request.onsuccess = function(e1) {

				var result = e1.target.result;

				if (result !== null && result !== undefined) {

					that.getOwnerComponent().getModel("modelCliente").setProperty("/Kunnr", result.kunnr);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Land1", result.land1);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Name1", result.name1);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Name2", result.name2);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Ort01", result.ort01);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Ort02", result.ort02);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Regio", result.regio);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Stras", result.stras);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Pstlz", result.pstlz);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Stcd1", result.stcd1);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Stcd2", result.stcd2);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Inco1", result.inco1);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Parvw", result.parvw);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Lifnr", result.lifnr);
					resolve();
				} else {
					console.log("ERRO!! Falha ao ler Clientes.");
					reject();
				}
			};
		},
		/*FIM carregaModelCliente*/

		onSelectionChange: function(oEvent) {
			oPedidosEnviar = [];
			oItensPedidoGridEnviar = [];
			oItensPedidoEnviar = [];

			var that = this;
			var oSelectedItems = this.getView().byId("table_pedidos").getSelectedItems();

			for (var i = 0; i < oSelectedItems.length; i++) {
				var nrPedido = oSelectedItems[i].getBindingContext("PedidosEnviar").getProperty("nrPedCli");

				for (var j = 0; j < oPedidoGrid.length; j++) {

					if (oPedidoGrid[j].nrPedCli == nrPedido) {
						oPedidosEnviar.push(oPedidoGrid[j]);
					} /*EndIf*/
				}

				for (var k = 0; k < oItensPedidoGrid.length; k++) {
					if (oItensPedidoGrid[k].nrPedCli == nrPedido) {
						oItensPedidoGridEnviar.push(oItensPedidoGrid[k]);
					}
				}
			}
		},
		/*FIM onSelectionChange*/

		onEnviarPedido: function(oEvent) {
			var that = this;

			if (oPedidosEnviar.length == 0) {

				MessageBox.show("Selecione pelo menos um pedido para enviar!", {
					icon: MessageBox.Icon.WARNING,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});

			} else {

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

					MessageBox.show("Deseja enviar os itens selecionados?", {
						icon: MessageBox.Icon.WARNING,
						title: "Envio de itens",
						actions: ["Enviar", "Cancelar"],
						onClose: function(oAction) {

							if (oAction == "Enviar") {

								var oModel = that.getOwnerComponent().getModel("modelAux").getProperty("/DBModel");
								
								oModel.setUseBatch(true);
								oModel.refreshSecurityToken();
								that.byId("table_pedidos").setBusy(true);

								var repres = that.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres");

								for (var j = 0; j < oPedidosEnviar.length; j++) {

									var bVerificadoPreposto = oPedidosEnviar[j].verificadoPreposto == undefined ? false : oPedidosEnviar[j].verificadoPreposto;
									var bRepresentante = that.getOwnerComponent().getModel("modelAux").getProperty("/Tipousuario") == "1";
									var iStatusPedido = oPedidosEnviar[j].idStatusPedido;

									if (bRepresentante && iStatusPedido == 9 && !bVerificadoPreposto) {
										var sPedido = oPedidosEnviar[j].nrPedCli;

										MessageBox.show("Pedido " + sPedido + " necessita ser revisado antes do envio.", {
											icon: MessageBox.Icon.ERROR,
											title: "Erro",
											actions: [MessageBox.Action.OK],
											onClose: function() {
												that.byId("table_pedidos").setBusy(false);
											}
										});

										return;
									}
								}

								for (j = 0; j < oItensPedidoGridEnviar.length; j++) {
									
									var objItensPedido = {
										Nrped: String(oItensPedidoGridEnviar[j].nrPedCli),
										Iditempedido: oItensPedidoGridEnviar[j].index,
										Matnr: String(oItensPedidoGridEnviar[j].matnr),
										Ntgew: String(oItensPedidoGridEnviar[j].ntgew),
										Kwmeng: String(oItensPedidoGridEnviar[j].zzQnt),
										Werks: String(oItensPedidoGridEnviar[j].werks),
										Vlrped: String(oItensPedidoGridEnviar[j].zzVprod)
									};
									
									// 	Iditempedido: String(oItensPedidoGridEnviar[j].idItemPedido),
									// 	Tindex: oItensPedidoGridEnviar[j].index,
									// 	Knumh: String(oItensPedidoGridEnviar[j].knumh),
									// 	Knumhextra: String(oItensPedidoGridEnviar[j].knumhExtra),
									// 	Zzregra: String(oItensPedidoGridEnviar[j].zzRegra),
									// 	Zzgrpmatextra: String(oItensPedidoGridEnviar[j].zzGrpmatExtra),
									// 	Zzgrpmat: String(oItensPedidoGridEnviar[j].zzGrpmat),
									// 	Zzregraextra: String(oItensPedidoGridEnviar[j].zzRegraExtra),
									// 	Maktx: String(oItensPedidoGridEnviar[j].maktx),
									// 	Matnr: String(oItensPedidoGridEnviar[j].matnr),
									// 	Nrpedcli: 
									// 	Ntgew: String(oItensPedidoGridEnviar[j].ntgew),
									// 	Tipoitem: String(oItensPedidoGridEnviar[j].tipoItem),
									// 	Zzdesext: String(oItensPedidoGridEnviar[j].zzDesext),
									// 	Zzdesitem: String(oItensPedidoGridEnviar[j].zzDesitem),
									// 	Zzpercdescdiluicao: String(oItensPedidoGridEnviar[j].zzPercDescDiluicao),
									// 	Zzpercdesctotal: String(oItensPedidoGridEnviar[j].zzPercDescTotal),
									// 	Zzpercom: String(oItensPedidoGridEnviar[j].zzPercom),
									// 	Zzpervm: String(oItensPedidoGridEnviar[j].zzPervm),
									// 	Zzvprod: String(oItensPedidoGridEnviar[j].zzVprod),
									// 	Zzvproddesc: String(oItensPedidoGridEnviar[j].zzVprodDesc),
									// 	Zzvproddesctotal: String(oItensPedidoGridEnviar[j].zzVprodDescTotal),
									// 	Length: String(oItensPedidoGridEnviar.length),
									// 	Zzvproddesc2: String(oItensPedidoGridEnviar[j].zzVprodDesc2),
									// 	Zzvprodminpermitido: String(oItensPedidoGridEnviar[j].zzVprodMinPermitido),
									// 	Zzvalordiluido: String(oItensPedidoGridEnviar[j].zzValorDiluido),
									// 	Zzvalexcedidoitem: String(oItensPedidoGridEnviar[j].zzValExcedidoItem),
									// 	Zzqntdiluicao: String(oItensPedidoGridEnviar[j].zzQntDiluicao),
									// 	Tipoitem2: String(oItensPedidoGridEnviar[j].tipoItem2),
									// 	Maxdescpermitidoextra: String(oItensPedidoGridEnviar[j].maxdescpermitidoExtra),
									// 	Maxdescpermitido: String(oItensPedidoGridEnviar[j].maxdescpermitido),
									// 	Mtpos: String(oItensPedidoGridEnviar[j].mtpos),
									// 	Kbetr: String(oItensPedidoGridEnviar[j].kbetr),
									// 	Zzvprodabb: String(oItensPedidoGridEnviar[j].zzVprodABB),
									// 	Aumng: String(oItensPedidoGridEnviar[j].aumng),
									// 	Zzqntamostra: String(oItensPedidoGridEnviar[j].zzQntAmostra),
									// 	Zzqnt: String(oItensPedidoGridEnviar[j].zzQnt),
									// 	Zzqntcpbrinde: String(oItensPedidoGridEnviar[j].zzQntCpBrinde),
									// 	Zzgrupoglobal: String(oItensPedidoGridEnviar[j].zzGrupoGlobal),
									// 	Zzqntregragb: String(oItensPedidoGridEnviar[j].zzQntRegraGb),
									// 	Zzutilcampglobal: String(oItensPedidoGridEnviar[j].zzUtilCampGlobal),
									// 	Zzatingiucmpglobal: String(oItensPedidoGridEnviar[j].zzAtingiuCmpGlobal)
									// };

									oModel.create("/InserirItemOV", objItensPedido, {
										method: "POST",
										success: function(data) {
											console.info("Itens Inserido");
											that.byId("table_pedidos").setBusy(false);
										},
										error: function(error) {
											that.byId("table_pedidos").setBusy(false);
											that.onMensagemErroODATA(error.statusCode);
										}
									});
								}

								for (var i = 0; i < oPedidosEnviar.length; i++) {
									
								/*  VKORG	VKORG	CHAR	4	0	Organização de vendas
									VTWEG	VTWEG	CHAR	2	0	Canal de distribuição
									SPART	SPART	CHAR	2	0	Setor de atividade
									KUNNR	KUNNR	CHAR	10	0	Nº cliente
									REPRS	ZEREPRS	CHAR	10	0	Representante
									AUART	AUART	CHAR	4	0	Tipo de documento de vendas
									ZLSCH	DZLSCH	CHAR	1	0	Forma de pagamento
									PLTYP	PLTYP	CHAR	2	0	Tipo de lista de preços
									ERDAT	ERDAT	DATS	8	0	Data de criação do registro
									ERZEIT	ERZEIT	TIMS	6	0	Hora da criação do registro
									ERNAM	ERNAM	CHAR	12	0	Nome do responsável que adicionou o objeto */

									var objPedido = {
										Nrped: oPedidosEnviar[i].nrPedCli,
										Idstatuspedido: String(oPedidosEnviar[i].idStatusPedido),
										Kunnr: oPedidosEnviar[i].kunnr,
										Werks: oPedidosEnviar[i].werks,
										Lifnr: repres,
										Auart: oPedidosEnviar[i].tipoPedido,
										Situacaopedido: oPedidosEnviar[i].situacaoPedido,
										Ntgew: String(oPedidosEnviar[i].ntgew),
										// Brgew: null, // Não usa
										// Dataentrega: "20181116", //Não usa
										Pltyp: String(oPedidosEnviar[i].tabPreco),
										Completo: oPedidosEnviar[i].completo,
										Valminped: String(oPedidosEnviar[i].valMinPedido),
										Erdat: String(oPedidosEnviar[i].dataImpl.substr(6, 4) + oPedidosEnviar[i].dataImpl.substr(3, 2) +
											oPedidosEnviar[i].dataImpl.substr(0, 2)),
										Horaped: String(oPedidosEnviar[i].dataImpl.substr(11, 2) + oPedidosEnviar[i].dataImpl.substr(14, 2) +
											oPedidosEnviar[i].dataImpl.substr(17, 2)),
										Obsped: oPedidosEnviar[i].observacaoPedido,
										Obsaudped: oPedidosEnviar[i].observacaoAuditoriaPedido,
										Existeentradapedido: String(oPedidosEnviar[i].existeEntradaPedido),
										Percentradapedido: String(oPedidosEnviar[i].percEntradaPedido),
										Valorentradapedido: String(oPedidosEnviar[i].valorEntradaPedido),
										Inco1: String(oPedidosEnviar[i].tipoTransporte),
										Diasprimeiraparcela: String(oPedidosEnviar[i].diasPrimeiraParcela),
										Quantparcelas: String(oPedidosEnviar[i].quantParcelas),
										Intervaloparcelas: String(oPedidosEnviar[i].intervaloParcelas),
										Tiponego: String(oPedidosEnviar[i].tipoNegociacao),
										// CodRepres: oPedidosEnviar[i].codRepres,
										Totitens: oPedidosEnviar[i].totalItensPedido,
										Valorcomissao: String(parseFloat(oPedidosEnviar[i].valComissaoPedido)),
										// ValDescontoTotal: oPedidosEnviar[i].valDescontoTotal,
										// ValMinPedido: oPedidosEnviar[i].valMinPedido,
										Valtotpedido: String(oPedidosEnviar[i].valTotPed),
										Valtotabcomissao: String(oPedidosEnviar[i].valTotalAbatidoComissao),
										Valabverba: String(oPedidosEnviar[i].valTotalAbatidoVerba),
										Vlrprz: String(oPedidosEnviar[i].valTotalExcedentePrazoMed),
										VlrprzCom: String(oPedidosEnviar[i].valUtilizadoComissaoPrazoMed),
										VlrprzVm: String(oPedidosEnviar[i].valUtilizadoVerbaPrazoMed), //NÃO UTILIZA VERBA PARA PRAZO 
										VlrprzDd: String(0), //CAMPO UTILIZADO APENAS NA APROVAÇÃO
										VlrprzVvb: String(0), //CAMPO UTILIZADO APENAS NA APROVAÇÃO
										Vlrdsc: String(oPedidosEnviar[i].valTotalExcedenteDesconto),
										VlrdscCom: String(oPedidosEnviar[i].valComissaoUtilizadaDesconto),
										VlrdscVm: String(oPedidosEnviar[i].valVerbaUtilizadaDesconto),
										VlrdscDd: String(0), //CAMPO UTILIZADO APENAS NA APROVAÇÃO
										VlrdscVvb: String(0), //CAMPO UTILIZADO APENAS NA APROVAÇÃO
										Vlramo: String(oPedidosEnviar[i].valTotalExcedenteAmostra),
										VlramoCom: String(oPedidosEnviar[i].valUtilizadoComissaoAmostra),
										VlramoVm: String(oPedidosEnviar[i].valUtilizadoVerbaAmostra),
										VlramoDd: String(0), //CAMPO UTILIZADO APENAS NA APROVAÇÃO
										VlramoVvb: String(0), //CAMPO UTILIZADO APENAS NA APROVAÇÃO
										Vlrbri: String(oPedidosEnviar[i].valTotalExcedenteBrinde),
										VlrbriCom: String(oPedidosEnviar[i].valUtilizadoComissaoBrinde),
										VlrbriVm: String(oPedidosEnviar[i].valUtilizadoVerbaBrinde),
										VlrbriDd: String(0), //CAMPO UTILIZADO APENAS NA APROVAÇÃO
										VlrbriVvb: String(0), //CAMPO UTILIZADO APENAS NA APROVAÇÃO
										Vlrbon: String(oPedidosEnviar[i].valTotalExcedenteBonif),
										VlrbonCom: String(oPedidosEnviar[i].valUtilizadoComissaoBonif),
										VlrbonVm: String(oPedidosEnviar[i].valUtilizadoVerbaBonif),
										VlrbonDd: String(0),
										VlrbonVvb: String(0),
										Valtotabcamppa: String(oPedidosEnviar[i].valUtilizadoCampProdutoAcabado),
										Valtotabcampbrinde: String(oPedidosEnviar[i].valTotalCampBrinde || 0),
										Valtotexcndirdesc: String(oPedidosEnviar[i].valTotalExcedenteNaoDirecionadoDesconto),
										Valtotexcndirprazo: String(oPedidosEnviar[i].valTotalExcedenteNaoDirecionadoPrazoMed),
										Valverbapedido: String(oPedidosEnviar[i].valVerbaPedido),
										BuGruop: "",
										Obscom: "",
										Obsdd: "",
										Obsvm: "",
										Obsvvb: "",
										Vlrutilvpm: String(oPedidosEnviar[i].valUtilizadoVerbaPrazoMed),
										Vltotexcndirbri: String(oPedidosEnviar[i].valTotalExcedenteNaoDirecionadoBrinde),
										Vltotexcndiramo: String(oPedidosEnviar[i].valTotalExcedenteNaoDirecionadoAmostra),
										Vltotexcndirbon: String(oPedidosEnviar[i].valTotalExcedenteNaoDirecionadoBonif),
										Valcampenxoval: String(oPedidosEnviar[i].valUtilizadoCampEnxoval),
										Valcampglobal: String(oPedidosEnviar[i].valCampGlobal),
										Vlrutilcampenx: String(oPedidosEnviar[i].valCampEnxoval),
										Valcampbrinde: String(oPedidosEnviar[i].valUtilizadoCampBrinde || 0),
										Usuario: String(oPedidosEnviar[i].codUsr),
										Tipousuario: String(oPedidosEnviar[i].tipoUsuario),
										Zlsch: String(oPedidosEnviar[i].zlsch),
										Zzprazomed: String(oPedidosEnviar[i].zzPrazoMedio)
									};

									oModel.create("/InserirOV", objPedido, {
										method: "POST",
										success: function(data) {

											var tx = db.transaction("PrePedidos", "readwrite");
											var objPedido = tx.objectStore("PrePedidos");

											var requestPrePedidos = objPedido.get(data.Nrpedcli);

											requestPrePedidos.onsuccess = function(e) {
												var oPrePedido = e.target.result;

												oPrePedido.idStatusPedido = 3;
												oPrePedido.situacaoPedido = "FIN";

												var requestPutItens = objPedido.put(oPrePedido);

												requestPutItens.onsuccess = function() {
													MessageBox.show("Pedido: " + data.Nrpedcli + " Enviado!", {
														icon: MessageBox.Icon.SUCCESS,
														title: "Pedido enviado!",
														actions: [MessageBox.Action.OK],
														onClose: function() {

															for (var o = 0; o < oPedidoGrid.length; o++) {
																if (oPedidoGrid[o].nrPedCli == data.Nrpedcli) {
																	oPedidoGrid.splice(o, 1);
																}
															}
															
															oModel = new sap.ui.model.json.JSONModel(oPedidoGrid);
															that.getView().setModel(oModel, "PedidosEnviar");
															that.byId("table_pedidos").setBusy(false);
														}
													});
												};
											};
										},
										error: function(error) {
											that.byId("table_pedidos").setBusy(false);
											that.onMensagemErroODATA(error.statusCode);
										}
									});
								}

								oModel.submitChanges();
							}
						}
					});
				};
			}
		},
		/*FIM onEnviarPedido*/
		
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
			var data = String(dia + "/" + mes);
			var horario = String(hora) + ":" + String(minuto);

			return [data, horario];
		},

		onDeletarPedido: function(oEvent) {
			var that = this;
			var oModel = that.getOwnerComponent().getModel("modelAux").getProperty("/DBModel");

			// var oModel = new sap.ui.model.odata.v2.ODataModel("http://104.208.137.3:8000/sap/opu/odata/sap/ZFORCA_VENDAS_VB_SRV/", {
			// 	json: true,
			// 	user: "appadmin",
			// 	password: "sap123"
			// });

			oModel.setUseBatch(true);
			// oModel.refreshSecurityToken();

			if (oPedidosEnviar.length == 0) {

				MessageBox.show("Selecione pelo menos um pedido para deletar!", {
					icon: MessageBox.Icon.WARNING,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});

			} else {

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

					that.byId("table_pedidos").setBusy(true);
					var oSelectedItems = that.getView().byId("table_pedidos").getSelectedItems();

					for (var i = 0; i < oSelectedItems.length; i++) {

						var nrPed = oSelectedItems[i].getBindingContext("PedidosEnviar").getProperty("nrPedCli");

						var store1 = db.transaction("PrePedidos", "readwrite");
						var objPedido = store1.objectStore("PrePedidos");
						
						var request = objPedido.delete(nrPed);
						
						request.onsuccess = function() {

							var mensagem = "Pedido" + nrPed + " deletado com sucesso!";

							sap.m.MessageBox.show(
								mensagem, {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Sucesso!",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.byId("table_pedidos").setBusy(false);
									}
								}
							);
						};
						request.onerror = function() {
							that.byId("table_pedidos").setBusy(true);
							console.log("Pedido não foi deletado!");
						};
						
						var store = db.transaction("ItensPedido", "readwrite").objectStore("ItensPedido");
						store.openCursor().onsuccess = function(event) {
								// consulta resultado do event
								var cursor = event.target.result;
								if (cursor) {
									if (cursor.value.nrPedCli === nrPed) {

										var store2 = db.transaction("ItensPedido", "readwrite");
										var objItemPedido = store2.objectStore("ItensPedido");

										request = objItemPedido.delete(cursor.key);
										request.onsuccess = function() {
											console.log("Itens Pedido deletado(s)!");
										};
										request.onerror = function() {
											console.log("Itens Pedido não foi deletado(s)!");
										};
									}
									cursor.continue();
								} else {
									that.onLoadPedidos();
									that.byId("table_pedidos").setBusy(true);
								}
							};
					}
				};
			}
		},
		
		onMensagemErroODATA: function(codigoErro) {

			if (codigoErro == 0) {
				sap.m.MessageBox.show(
					"Verifique a conexão com a internet!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Falha na Conexão!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {

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

						}
					}
				);
			}
		},
		/*FIM onMensagemErroODATA*/

		onVerificarAprovadorUsuario: function(p1res, p1rej) {
				var oModel = this.getOwnerComponent().getModel("modelAux").getProperty("/DBModel");
				var CodRepres = this.getOwnerComponent().getModel("modelAux").getProperty("/CodRepres");

				oModel.read("/FluxoAprovacao('" + CodRepres + "')", {
					success: function(retorno) {
						var bExisteAprovadores = retorno.ERetorno == "S";

						if (bExisteAprovadores) {
							p1res();
						} else {
							p1rej("Usuário atual não possui aprovadores cadastrados, favor entrar em contato com a administração do sistema.");
						}
					},
					error: function(error) {
						console.log(error);
						p1rej("Erro ao verificar aprovadores.");
					}
				});
			}
			/*FIM onVerificarAprovadorUsuario*/
	});
});