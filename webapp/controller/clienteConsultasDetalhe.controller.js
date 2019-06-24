/*eslint-disable no-console, no-alert */
sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/core/routing/History"
], function(BaseController, History) {
	"use strict";

	return BaseController.extend("testeui5.controller.clienteConsultasDetalhe", {

		onInit: function(oEvent) {
			this.getRouter().getRoute("clienteConsultasDetalhe").attachPatternMatched(this._onLoadFields, this);
		},

		onAfterRendering: function() {

			// this.getView().
			// sap.m.QuickViewBase.getOwnerComponent().getModel("modelCliente").afterNavigate().getProperty("/codigoCliente");
		},

		onNavBack: function(oEvent) {

			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("clienteConsultas", {}, true);
			}
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("clienteConsultas");
		},

		_onLoadFields: function() {
			var that = this;
			var oVetorTabPreco = [];
			this.byId("idTopLevelIconTabBar").setSelectedKey("tab1");
			var codigoCliente = this.getOwnerComponent().getModel("modelCliente").getProperty("/codigoCliente");

			var open = indexedDB.open("VB_DataBase");

			open.onerror = function() {
				console.log(open.error.mensage);
			};

			open.onsuccess = function() {
				var db = open.result;
				//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CARREGAR A TABELA DE PREÇOS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				var store = db.transaction("Clientes", "readonly").objectStore("Clientes");
				store.get(codigoCliente).onsuccess = function(event) {
					var vCliente = event.target.result;

					//var oModelCliente = new sap.ui.model.json.JSONModel(vCliente);
					var oModelCliente = new sap.ui.model.json.JSONModel();
					oModelCliente.setData(vCliente);

					that.getView().setModel(oModelCliente, "clienteModel");
					
					var transactionA961 = db.transaction(["A961"], "readonly");
					var objectStoreA961 = transactionA961.objectStore("A961");
		
					objectStoreA961.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							
							if (cursor.value.kunnr == codigoCliente) {
		
								oVetorTabPreco.push(cursor.value);
							}
		
							cursor.continue();
		
						} else {
		
							var oModelTabPreco = new sap.ui.model.json.JSONModel(oVetorTabPreco);
							that.getView().setModel(oModelTabPreco, "tabPreco");
						}
					};
				};
			};
		}
	});
});