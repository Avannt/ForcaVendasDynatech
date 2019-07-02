sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/m/Input"
], function(BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("testeui5.controller.App", {

		onInit: function(evt) {
			// this.getView().byId("label").setVisible(false);
			//this.getView().byId("shellHeadUser").setVisible(false);
			//this.getView().byId("idLogoff").setVisible(false);

			var oModel = new sap.ui.model.json.JSONModel({
				modelUserNameShell: "",
				modelUserIdShell: "",
				modelUserDepartamentShell: ""
			});
			this.getOwnerComponent().setModel(oModel, "modelShell");
			
		},

		onAfterRendering: function() {

		},

		handlePressHome: function(e) {
			var that = this;

			sap.ui.core.UIComponent.getRouterFor(that).navTo("menu");
			that.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", "");
			this.onResetaCamposPrePedido();
			
			// var oModel = new sap.ui.model.json.JSONModel();
			// this.getView().setModel(oModel);
			// this.getOwnerComponent().setModel(oModel, "modelCliente");
			// this.getOwnerComponent().setModel(oModel, "modelDadosPedido");
			// this.getOwnerComponent().setModel(oModel, "modelDescontos");
			// this.getOwnerComponent().getModel(oModel, "modelAux");
			// this.getOwnerComponent().getModel("modelDescontos").setProperty("/descontoAplicar", 0);
			// this.getOwnerComponent().getModel("modelDescontos").setProperty("/descontoDisponivel", 0);
			// this.getOwnerComponent().getModel("modelDadosPedido").getProperty("/idDesconto", "");
			// this.getOwnerComponent().getModel("modelDescontos").setProperty("/idDescontoCamp", "");
			// this.getOwnerComponent().getModel("modelDescontos").setProperty("/descontoAplicarCamp", 0);
			// this.getOwnerComponent().getModel("modelDescontos").setProperty("/descontoDisponivelCamp", 0);
			// this.getOwnerComponent().getModel("modelDescontos").setProperty("/idDescontoBoleto", "");
			// this.getOwnerComponent().getModel("modelDescontos").setProperty("/descontoAplicarBoleto", 0);
			// this.getOwnerComponent().getModel("modelAux").setProperty("/numeroPedido", "");
			
			// var IdBase1 = this.getOwnerComponent().getModel("modelAux").getProperty("/IdBase");

			// if (IdBase1 != undefined && IdBase1 != null && IdBase1 != "") {
			// 	var open = indexedDB.open("Dyna_DataBase");

			// 	open.onerror = function(hxr) {
			// 		console.log("Erro ao abrir tabelas.");
			// 		console.log(hxr.Message);
			// 	};

			// 	open.onsuccess = function(e) {
			// 		console.log(e);
			// 		var db = e.target.result;

			// 		var tx = db.transaction("Usuarios", "readwrite");
			// 		var objUsuarios = tx.objectStore("Usuarios");

			// 		var request = objUsuarios.get(that.getOwnerComponent().getModel("modelAux").getProperty("/IdBase"));
			// 		request.onsuccess = function(e) {
			// 			var result = e.target.result;

			// 			if (result == undefined) {
			// 				MessageBox.show("Por Favor faça o login da empresa e atualize as tabelas.", {
			// 					icon: MessageBox.Icon.WARNING,
			// 					title: "Atualizações das tabelas",
			// 					actions: [MessageBox.Action.OK],
			// 					onClose: function() {
			// 						// that.byId("cbEmpresa").setSelectedKey("");
			// 					}
			// 				});
			// 			} else if (result.atualizacao == "Sim") {
			// 				MessageBox.show("Existe uma atualização nas tabelas. Por Favor atualize as tabelas.", {
			// 					icon: MessageBox.Icon.WARNING,
			// 					title: "Atualizações das tabelas",
			// 					actions: [MessageBox.Action.OK],
			// 					onClose: function() {
			// 						// that.byId("cbEmpresa").setSelectedKey("");
			// 					}
			// 				});
			// 			} else if (result.dataAtualizacao == undefined) {
			// 				MessageBox.show("Por Favor faça as atualizações das tabelas.", {
			// 					icon: MessageBox.Icon.WARNING,
			// 					title: "Atualizações das tabelas",
			// 					actions: [MessageBox.Action.OK],
			// 					onClose: function() {
			// 						// that.byId("cbEmpresa").setSelectedKey("");
			// 					}
			// 				});
			// 			} else {
			// 				var date = new Date();
			// 				var dia = parseInt(date.getDate());
			// 				var mes = parseInt(date.getMonth()) + 1;

			// 				var dataAtual = dia + mes;

			// 				//OBJ ENCONTRADO NO BANCO... ATUALIZA ELE.

			// 				var data = result.dataAtualizacao;
			// 				data = data.split("-");
			// 				var data1 = data[0].split("/");
			// 				var hora1 = data[1].split(":");
			// 				// data = data.split("/");
			// 				var dataDia = parseInt(data1[0]);
			// 				var dataMes = parseInt(data1[1]);
			// 				var dataBanco = dataDia + dataMes;
			// 				// hora1 = hora1.split(":");
			// 				var dataHora = hora1[0];
			// 				var dataMin = hora1[1];

			// 				// var tamanhoDia = parseInt(dataDia.length);
			// 				// if (tamanhoDia == 1) {
			// 				// 	dataDia = String("0" + dataDia);
			// 				// }

			// 				var dataAtualizacao = dataDia + "/" + dataMes + "-";
			// 				// if (dataHora < 10) {
			// 				// 	dataHora = "0" + dataHora;
			// 				// }
			// 				// if (dataMin < 10) {
			// 				// 	dataMin = "0" + dataMin;
			// 				// }
			// 				dataAtualizacao += dataHora + ":" + dataMin;

			// 				if (dataBanco >= dataAtual) {

			// 					that.getOwnerComponent().getModel("modelAux").setProperty("/dataUltimoUpdate", dataAtualizacao);

			// 					// MessageBox.show("Logado com Sucesso na EMPRESA" + IdBase1, {
			// 					// 	icon: MessageBox.Icon.SUCCESS,
			// 					// 	title: "Acesso concedido",
			// 					// 	actions: [MessageBox.Action.OK],
			// 					// 	onClose: function() {
			// 					// 		// if (that._ItemDialog) {
			// 					// 		// 	that._ItemDialog.destroy(true);
			// 					// 		// }
			// 					// 		sap.ui.core.UIComponent.getRouterFor(that).navTo("menu");

			// 					// 		if (!that._CreateMaterialFragment) {
			// 					// 			that._ItemDialog = sap.ui.xmlfragment(
			// 					// 				"testeui5.view.Promocoes",
			// 					// 				that
			// 					// 			);
			// 					// 			that._ItemDialog.open();
			// 					// 		}
			// 					// 	}
			// 					// });
			// 					sap.ui.core.UIComponent.getRouterFor(that).navTo("menu");

			// 					// if (!that._CreateMaterialFragment) {
			// 					// 	that._ItemDialog = sap.ui.xmlfragment(
			// 					// 		"testeui5.view.Promocoes",
			// 					// 		that
			// 					// 	);
			// 					// 	that._ItemDialog.open();
			// 					// }
			// 					console.log("As tabelas estão atualizadas");
			// 				} else {

			// 					//EXCLUIR AS tabelas e substituir pelas atuais 
			// 					MessageBox.show("As tabelas estão desatualizadas, Por Favor Realize a atualização.", {
			// 						icon: MessageBox.Icon.WARNING,
			// 						title: "Tabelas Desatualizadas.",
			// 						actions: [MessageBox.Action.OK],
			// 						onClose: function() {
			// 							// that.byId("cbEmpresa").setSelectedKey("");
			// 						}
			// 					});
			// 					console.log("Precisa atualizar as tabelas");
			// 				}
			// 			}
			// 		};

			// 		request.onerror = function(e) {
			// 			console.log("Error");
			// 			console.dir(e);
			// 		};
			// 	};
			// } else {
			// 	MessageBox.show("Selecione uma empresa!", {
			// 		icon: sap.m.MessageBox.Icon.WARNING,
			// 		title: "Campo empresa está vazio.",
			// 		actions: [MessageBox.Action.OK]
			// 	});
			// }
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("menu");
		},
		
		onResetaCamposPrePedido: function () {
			//*modelDadosPedido
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/SituacaoPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IdStatusPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataImpl", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DataPedido", "");
			// this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/LocalEntrega", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/DiasPrimeiraParcela", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/QuantParcelas", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/IntervaloParcelas", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ObservacaoPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ObservacaoAuditoriaPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ExisteEntradaPedido", false);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/PercEntradaPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValorEntradaPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TabPreco", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoTransporte", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoNegociacao", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TipoPedido", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Completo", "");
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotPed", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValMinPedido", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValDescontoTotal", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValVerbaPedido", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValComissaoPedido", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/TotalItensPedido", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampGlobal", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampBrinde", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValCampEnxoval", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalAcresPrazoMed", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/ValTotalExcedenteDescontos", 0);
			this.getOwnerComponent().getModel("modelDadosPedido").setProperty("/Ntgew", 0);

			var objItensPedidoTemplate = [];
			var oModel = new sap.ui.model.json.JSONModel(objItensPedidoTemplate);
			this.getView().setModel(oModel, "ItensPedidoGrid");
		},

		showId: function() {
			var id = this.getOwnerComponent().getModel("modelAux").getProperty("/CodUsr");
			if (id == 'undefined' || id == "" || id == null) {
				sap.m.MessageToast.show("Selecione uma empresa e/ou faça login.", {
					duration: 5000
				});
			} else {
				sap.m.MessageToast.show("Usuário:" + id, {
					duration: 5000
				});
			}

		},
		
		handleLogoffPress: function() {
			
			var that = this; // RECONHECE O CONTROLER ATUAL CHAMADO.
			// if (sap.ui.core.UIComponent.getRouterFor(this) == "login") {
			var rota = this.getRouter().getRoute("login");
			if (rota._oRouter._sActiveRouteName == "login") {
				MessageBox.show("Você já está na página de login. Faça login!", {
					icon: MessageBox.Icon.Warning,
					title: "Faça o Login!",
					actions: [MessageBox.Action.OK]
				});
			} else {
				MessageBox.show("Você vai ser redirecionado para a página de inicial para fazer login novamente.", {
					icon: MessageBox.Icon.ERROR,
					title: "Logout realizado.",
					actions: [MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if (oAction == sap.m.MessageBox.Action.YES) {
							// sap.ui.getCore().byId("usuario").setValue("teste");
							// sap.ui.getCore().byId("senha").getValue("teste");
							that.getOwnerComponent().getModel("modelAux").setProperty("/homeVisible", false);
							sap.ui.core.UIComponent.getRouterFor(that).navTo("login");
							that.onResetaCamposPrePedido();
						}
					}
				});
			}
		}
	});
});