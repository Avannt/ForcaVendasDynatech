/*eslint-disable no-console, no-alert */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"testeui5/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function(jQuery, MessageToast, Fragment, BaseController, Filter, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("testeui5.controller.Pedido", {

		onInit: function() {
			this.getRouter().getRoute("pedido").attachPatternMatched(this._onLoadFields, this);
		},

		onNavBack: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("menu");
		},

		formatRentabilidade: function(Value) {
			if (Value > -3) {
				this.byId("table_pedidos").getColumns()[6].setVisible(false);
				return "";

			} else {
				this.byId("table_pedidos").getColumns()[6].setVisible(true);
				return Value;
			}
		},

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

		_onLoadFields: function() {
			var that = this;

			this.navBack2();
			that.vetorCliente = [];
			that.oPrePedidos = [];
			that.oVetorTitulos = [];
			this.getView().byId("objectHeader").setTitle();
			this.getView().byId("objectHeader").setNumber();
			this.getView().byId("objectAttribute_cnpj").setText();
			this.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
			this.getOwnerComponent().getModel("modelAux").setProperty("/Kunnr", "");
			this.getOwnerComponent().getModel("modelAux").setProperty("/idFiscalCliente", "");

			var oModel = new sap.ui.model.json.JSONModel();
			that.getView().setModel(oModel, "pedidosCadastrados");

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

				var transaction = db.transaction("Clientes", "readonly");
				var objectStore = transaction.objectStore("Clientes");

				if ("getAll" in objectStore) {
					objectStore.getAll().onsuccess = function(event) {
						that.vetorCliente = event.target.result;

						var oModel = new sap.ui.model.json.JSONModel(that.vetorCliente);
						that.getView().setModel(oModel, "clientesCadastrados");
					};

				}
			};
		},

		onDialogCloseImagem: function() {
			if (this._ItemDialog) {
				this._ItemDialog.destroy(true);
			}
		},

		onAfterRendering: function() {
			var oSplitCont = this.getSplitContObj(),
				ref = oSplitCont.getDomRef() && oSplitCont.getDomRef().parentNode;
			// set all parent elements to 100% height, this should be done by app developer, but just in case
			if (ref && !ref._sapui5_heightFixed) {
				ref._sapui5_heightFixed = true;
				while (ref && ref !== document.documentElement) {
					var $ref = jQuery(ref);
					if ($ref.attr("data-sap-ui-root-content")) { // Shell as parent does this already
						break;
					}
					if (!ref.style.height) {
						ref.style.height = "100%";
					}
					ref = ref.parentNode;
				}
			}
		},

		getSplitContObj: function() {
			var result = this.byId("SplitContDemo");
			if (!result) {
				jQuery.sap.log.error("SplitApp object can't be found");
			}
			return result;
		},

		onPressNavToDetail: function() {
			this.getSplitContObj().to(this.createId("detailDetail"));
		},

		navBack2: function() {
			var isTablet = this.getOwnerComponent().getModel("modelAux").getProperty("/isTablet");

			if (isTablet == true) {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("menu");
			} else {
				// sap.ui.core.UIComponent.getRouterFor(this).navTo("menu");
				// sap.ui.core.UIComponent.getRouterFor(this).navTo("pedido");

				// this.byId("table_pedidos").clearSelection();
				this.byId("listClientes").removeSelections(true);
				this.onPressDetailBack();
			}
		},

		onPressDetailBack: function() {
			this.getSplitContObj().backDetail();
			// this.getView().byId("ObjListCliente").removeSelections(true);
			// this.byId("ObjListCliente").setProperty("/selected", false);
		},

		onSelectionChange: function(oEvent) {
			var that = this;
			that.oPrePedidos = [];
			//filtra somente os pedidos do cliente e vai pra detail
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			//seta os dados da objectHeader
			this.getView().byId("objectHeader").setTitle(oItem.getTitle());
			this.getView().byId("objectHeader").setNumber(oItem.getNumber());
			this.getView().byId("objectAttribute_cnpj").setText(oItem.getIntro());
			this.getOwnerComponent().getModel("modelAux").setProperty("/Kunnr", oItem.getNumber());
			this.getSplitContObj().toDetail(this.createId("detail"));
			
			var iIndexCliente = oEvent.getSource()._aSelectedPaths[0].replace("/", "");
			var sCnpj = this.getModel("clientesCadastrados").getData()[iIndexCliente].stcd1;
			this.getOwnerComponent().getModel("modelAux").setProperty("/idFiscalCliente", sCnpj);
			
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
					that.carregaModelCliente(db, resolve, reject);
				});

				promise.then(function() {
					var transactionPrePedidos = db.transaction("PrePedidos", "readonly");
					var objectStorePrePedidos = transactionPrePedidos.objectStore("PrePedidos");

					objectStorePrePedidos.openCursor().onsuccess = function(event) {
						// consulta resultado do event
						var cursor = event.target.result;
						if (cursor) {
							if (cursor.value.kunnr == that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr")) {
								that.oPrePedidos.push(cursor.value);
							}

							cursor.continue();

						} else {

							var oModel = new sap.ui.model.json.JSONModel(that.oPrePedidos);
							that.getView().setModel(oModel, "pedidosCadastrados");

						}
					};
				});
			};
		},

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
					that.getOwnerComponent().getModel("modelCliente").setProperty("/Telf1", result.telf1);
					that.getOwnerComponent().getModel("modelCliente").setProperty("/efetuoucompra", result.efetuoucompra);
					resolve();
				} else {
					console.log("ERRO!! Falha ao ler Clientes.");
					reject();
				}
			};
		},

		onSearch: function(oEvent) {

			var sValue = oEvent.getSource().getValue();
			var aFilters = [];
			var oFilter = [new sap.ui.model.Filter("kunnr", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("name1", sap.ui.model.FilterOperator.Contains, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			//oEvent.getSource().getBinding("items").filter(aFilters, "Application");
			this.byId("listClientes").getBinding("items").filter(aFilters, "Application");

		},

		onAddPedido: function() {
			var pedido = "";
			var that = this;
			var existeTituloVencido = false;
			var date = new Date();
			var open1 = indexedDB.open("VB_DataBase");

			open1.onerror = function(hxr) {
				console.log("Erro ao abrir tabelas.");
				console.log(hxr.Message);
			};
			//Load tables
			open1.onsuccess = function(e) {
				var db = open1.result;

				var cliente = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");
				if (cliente == "") {

					MessageBox.show("Nenhum cliente selecionado! Selecione um cliente!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Nenhum cliente selecionado",
						actions: [MessageBox.Action.OK]
					});

				} else {
					var store = db.transaction("PrePedidos").objectStore("PrePedidos");
					store.openCursor().onsuccess = function(event) {
						// consulta resultado do event
						var cursor = event.target.result;

						if (cursor) {
							if (cursor.value.idStatusPedido != 3 && cursor.value.completo != "Sim") {
								cliente = cursor.value.kunnr;
								pedido = cursor.value.nrPedCli;
							}
							cursor.continue();
						} else {
							if (cliente != "" && pedido != "") {
								MessageBox.show("O pedido do cliente " + cliente + " está incompleto.", {
									icon: MessageBox.Icon.ERROR,
									title: "Falha iniciar do pedido",
									actions: [MessageBox.Action.OK]
								});
							} else {
										
								var transaction = db.transaction("TitulosAbertos", "readonly");
								var objectStoreTitulos = transaction.objectStore("TitulosAbertos");
					
								var indexMtpos = objectStoreTitulos.index("kunnr");
					
								var request = indexMtpos.getAll(that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr"));
				
								request.onsuccess = function(event) {
									that.oVetorTitulos = event.target.result;
									
									if(that.oVetorTitulos != ""){
										for(var i=0; i<that.oVetorTitulos.length; i++){
											if(that.oVetorTitulos[i].zfbdt < date){
												existeTituloVencido = true;
											}
										}
										
										if(existeTituloVencido == true){
											MessageBox.show("O Cliente " + that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr") + 
												" possui títulos em aberto!", {
												icon: sap.m.MessageBox.Icon.WARNING,
												title: "Títulos em Aberto!",
												actions: ["Ver Titulo", "Continuar", "Cancelar"],
												onClose: function(oAction){
													if(oAction == "Ver Titulo"){
														that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");
														sap.ui.core.UIComponent.getRouterFor(that).navTo("relatorioTitulos");
													} else if(oAction == "Continuar"){
														sap.ui.core.UIComponent.getRouterFor(that).navTo("pedidoDetalhe");
													} else {
														
													}
												}
										});
										} else{
											sap.ui.core.UIComponent.getRouterFor(that).navTo("pedidoDetalhe");
										}
										
									} else{
										
										sap.ui.core.UIComponent.getRouterFor(that).navTo("pedidoDetalhe");
									}
								};
							}
						}
					};
				}
			};
		},
		
		onItemPress: function(oEvent) {
			var that = this;
			var oNumeroPedido = oEvent.getParameter("listItem") || oEvent.getSource();
			var open1 = indexedDB.open("VB_DataBase");

			open1.onerror = function(hxr) {
				console.log("Erro ao abrir tabelas.");
				console.log(hxr.Message);
			};
			//Load tables
			open1.onsuccess = function(e) {
				var db = open1.result;

				var NrPedido = oNumeroPedido.getBindingContext("pedidosCadastrados").getProperty("nrPedCli");
				var sStatus = oNumeroPedido.getBindingContext("pedidosCadastrados").getProperty("situacaoPedido");
				
				that.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", NrPedido);
				
				new Promise(function(res1, rej1){
					/* Se o status for PEN (Pendente), devo perguntar se o usuário deseja editar o pedido */
					if (sStatus == "PEN" || sStatus == "Preposto"){
						MessageBox.show("Deseja reabrir o pedido?", {
							icon: MessageBox.Icon.WARNING,
							title: "Pedido finalizado.",
							actions: ["Reabrir", "Vizualizar", sap.m.MessageBox.Action.CANCEL],
							onClose: function(oAction) {
								
								/* Caso afirmativo, altero o status do pedido para 2 (Em digitação) (idStatusPedido = 2)*/
								if (oAction == "Reabrir") {
									var store1 = db.transaction("PrePedidos", "readwrite");
									var objPedido = store1.objectStore("PrePedidos");
									var req = objPedido.get(NrPedido);
									
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
											res1();
											console.log("O pedido foi reaberto.");
										};
										
										req.onerror = function() {
											/* Erro ao reabir pedido */
											rej1("Erro ao reabrir pedido!");
											console.log("Erro ao abrir o Pedido > " + NrPedido);
										};
									};
								}
								
								/* Se o usuário escolher Vizualizar, levo o usuário direto para o pedido sem alterar o status */
								if (oAction == "Vizualizar") {
									res1();
								}
								
								/* Caso negativo, mantenho o status do pedido em 3 (Finalizado) (idStatusPedido = 3)*/
							}
						});
					} else {
						res1();
					}
					/* ---------------------------------------------- */
					
				}).then(function(){
					var promise = new Promise(function(resolve, reject) {
						that.carregaModelCliente(db, resolve, reject);
					});
	
					promise.then(function() {
						sap.ui.core.UIComponent.getRouterFor(that).navTo("pedidoDetalhe");
					});
				}).catch(function(err){
					MessageBox.error(err, {
						icon: MessageBox.Icon.WARNING,
						title: "Reabrir pedido.",
						actions: [sap.m.MessageBox.Action.OK]
					});
					
				});
			};
		},

		onExcluirPedido: function(oEvent) {
			var that = this;
			var naoDeletar = false;
			var oNumeroPedido = oEvent.getParameter("listItem") || oEvent.getSource();
			var NrPedido = oNumeroPedido.getBindingContext("pedidosCadastrados").getProperty("nrPedCli");

			MessageBox.show("Deseja mesmo excluir o pedido?.", {
				icon: MessageBox.Icon.WARNING,
				title: "Exclusão de Pedidos",
				actions: [MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
				onClose: function(oAction) {
					if (oAction == sap.m.MessageBox.Action.YES) {
						var open = indexedDB.open("VB_DataBase");

						open.onerror = function() {
							MessageBox.show(open.error.mensage, {
								icon: MessageBox.Icon.ERROR,
								title: "Banco não encontrado, exclusão pedido!",
								actions: [MessageBox.Action.OK]
							});
						};

						open.onsuccess = function() {
							for (var i = 0; i < that.oPrePedidos.length; i++) {
								if (that.oPrePedidos[i].nrPedCli == NrPedido) {
									if (that.oPrePedidos[i].idStatus === 3) {
										naoDeletar = true;
									} else {
										that.oPrePedidos.splice(i, 1);
									}
								}
							}
							var oModel = new sap.ui.model.json.JSONModel(that.oPrePedidos);
							that.getView().setModel(oModel, "pedidosCadastrados");

							if (naoDeletar === true) {
								MessageBox.show("Esse Pedido está com status Finalizado e não pode ser deletado.", {
									icon: MessageBox.Icon.WARNING,
									title: "Impossivel Excluir",
									actions: [MessageBox.Action.OK]
								});

							} else {
								var db = open.result;
								var store1 = db.transaction("PrePedidos", "readwrite");
								var objPedido = store1.objectStore("PrePedidos");
								var request = objPedido.delete(NrPedido);

								request.onsuccess = function() {

									that.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
									console.log("Pedido deletado!");

								};
								request.onerror = function() {
									console.log("Pedido não foi deletado!");
								};

								var store = db.transaction("ItensPedido", "readwrite").objectStore("ItensPedido");
								store.openCursor().onsuccess = function(event) {
									// consulta resultado do event
									var cursor = event.target.result;
									if (cursor) {
										if (cursor.value.nrPedCli === NrPedido) {
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
										oModel = new sap.ui.model.json.JSONModel(that.oPrePedidos);
										that.getView().setModel(oModel, "PedidosCadastrados");
									}
								};
							}
						};
					}
				}
			});
		},

		handleLinkPress: function() {
			var cliente = this.getOwnerComponent().getModel("modelAux").getProperty("/CodCliente");
			this.getOwnerComponent().getModel("modelAux").setProperty("/telaPedido", true);
			// alert(cliente);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("relatorioTitulos");
		}
	});
});