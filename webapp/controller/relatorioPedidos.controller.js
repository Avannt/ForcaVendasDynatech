/*eslint-disable no-console, no-alert */
sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"testeui5/model/formatter",
	"sap/ui/model/Filter"

], function(BaseController, Filter, MessageBox) {
	"use strict";
	var oPrePedidoRelatorio = [];
	var ajaxCall;
	return BaseController.extend("testeui5.controller.relatorioPedidos", {

		onInit: function() {

			//FORÇA FAZER O INIT DA PÁGINA .. MESMO QUE JÁ FOI INICIADA.
			this.getRouter().getRoute("relatorioPedidos").attachPatternMatched(this._onLoadFields, this);
		},

		_onLoadFields: function() {

			var that = this;
			var oclientes = [];
			oPrePedidoRelatorio = [];
			this.byId("table_relatorio_pedidos").setBusy(true);

			var oModel = this.getOwnerComponent().getModel("modelAux").getProperty("/DBModel");
			this.getView().getModel("modelAux");

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
					
				var store = db.transaction("StatusPedidos").objectStore("StatusPedidos");
				store.getAll().onsuccess = function(event1) {
					var vPedidos = event1.target.result;
					
					//CARREGA OS CAMPOS DO LOCAL DE ENTREGA
					store = db.transaction("Clientes").objectStore("Clientes");
					store.getAll().onsuccess = function(event) {
						var vClientes = event.target.result;
						
						for (var i = 0; i < vPedidos.length; i++) {
							
							var oCliente = vClientes.find(function(cliente){
								return vPedidos[i].Kunnr === cliente.kunnr;
							});
							
							if (oCliente){
								vPedidos[i].NameOrg1 = oCliente.name1;			
							}
							
							/* Converto a data */
							if (vPedidos[i].Erdat){
								var dData = vPedidos[i].Erdat;
								var sData = dData.getDate().toString() + "/" + (dData.getMonth() + 1).toString() + "/" + dData.getFullYear().toString();
								
								vPedidos[i].Erdat = sData;
							}else{
								vPedidos[i].Erdat = "";
							}
							
							/* Vejo se o pedido de vendas está inconsistente no Sap (Vbeln em branco) */
							if((vPedidos[i].Vbeln || "") == ""){
								vPedidos[i].PedInconsistente = "Inconsistente";
							}else{
								vPedidos[i].PedInconsistente = "";
							}
						}

						oModel = new sap.ui.model.json.JSONModel(vPedidos);
						that.getView().setModel(oModel, "pedidoRelatorio");

						that.byId("table_relatorio_pedidos").setBusy(false);
					};
					
				};

			};
		},

		handleChange: function(oEvent) {

			var aFilters = [];
			var oDP = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}

			var oFilter = [
				new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("table_relatorio_pedidos").getBinding("items").filter(aFilters, "Application");

		},

		onSearch: function(oEvent) {

			var sValue = oEvent.getSource().getValue();
			var aFilters = [];
			var oFilter = [
				new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Namecli", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Namerep", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Nrpedcli", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("NameOrg1", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("AprovNome", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("AprovadoDesc", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("PedInconsistente", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.Contains, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("table_relatorio_pedidos").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

		},

		myFormatterName: function(value) {

			if (value.length > 28) {

				return value.substring(0, 20) + "...";

			} else {

				return value;
			}
		},
		/* myFormatterName */
		
		onNavBack: function(){
			sap.ui.core.UIComponent.getRouterFor(this).navTo("menuConsultas");
		},
		/* onNavBack */

		onItemPressPED: function(oEvent) {
			// var that = this;
			// var oEvItemPressed = oEvent;
			// var oBd = oEvItemPressed.getParameter("listItem") || oEvent.getSource();
			
			// var sNrpedcli = oBd.getBindingContext("pedidoRelatorio").getProperty("Nrpedcli");
			// var Namecli = oBd.getBindingContext("pedidoRelatorio").getProperty("NameOrg1");
			// var Kunnr = oBd.getBindingContext("pedidoRelatorio").getProperty("Kunnr");

			// MessageBox.show("Deseja abrir o item selecionado?", {
			// 	icon: MessageBox.Icon.WARNING,
			// 	title: "Editar",
			// 	actions: ["Sim", "Cancelar"],
			// 	onClose: function(oAction) {
			// 		if (oAction == "Sim") {
			// 			/* Gravo no ModelAux a propriedade Kunrg (Cod cliente) para receber lá na tela de entrega futura e 
			// 			selecionar o cliente automaticamente. */
			// 			that.getOwnerComponent().getModel("modelAux").setProperty("/NrPedCli", sNrpedcli);
			// 			that.getOwnerComponent().getModel("modelAux").setProperty("/Kunnr", Kunnr);
			// 			that.getOwnerComponent().getModel("modelAux").setProperty("/Namecli", Namecli);
						
			// 			sap.ui.core.UIComponent.getRouterFor(that).navTo("PedidoDetalheRel");
			// 		}
			// 	}
			// });

		} /* onItemPressPED */
	});
});