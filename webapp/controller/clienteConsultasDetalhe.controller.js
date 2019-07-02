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

			var open = indexedDB.open("Dyna_DataBase");

			open.onerror = function() {
				console.log(open.error.mensage);
			};

			open.onsuccess = function() {
				var db = open.result;
				
				var store = db.transaction("Materiais", "readonly").objectStore("Materiais");
				
				new Promise(function(res, rej){
					store.getAll().onsuccess = function(event){
						var vMateriais = event.target.result;
						
						res(vMateriais);
					};
				}).then(function(vMateriais){
					//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CARREGAR A TABELA DE PREÇOS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
					store = db.transaction("Clientes", "readonly").objectStore("Clientes");
					var ixKunnr = store.index("kunnr");
					ixKunnr.get(codigoCliente).onsuccess = function(event) {
						var vCliente = event.target.result;
	
						//var oModelCliente = new sap.ui.model.json.JSONModel(vCliente);
						var oModelCliente = new sap.ui.model.json.JSONModel();
						oModelCliente.setData(vCliente);
	
						that.getView().setModel(oModelCliente, "clienteModel");
						
						var transactionA961 = db.transaction(["A990"], "readonly");
						var objectStoreA961 = transactionA961.objectStore("A990");
			
						objectStoreA961.openCursor().onsuccess = function(event) {
							var cursor = event.target.result;
							if (cursor) {
								
								if (cursor.value.kunnr == codigoCliente) {
									
									/* Somente adiciono preço de vendas */
									if(cursor.value.kschl === "ZPR0"){
										
										var oMaterial = vMateriais.find(function(material){
											if(material.matnr == cursor.value.matnr){
												return true;
											}
										});
										
										if(oMaterial){
											cursor.value.maktx = oMaterial.maktx;
										}
										oVetorTabPreco.push(cursor.value);
									}
								}
			
								cursor.continue();
			
							} else {
			
								var oModelTabPreco = new sap.ui.model.json.JSONModel(oVetorTabPreco);
								that.getView().setModel(oModelTabPreco, "tabPreco");
							}
						};
						
						
					};
				});
			};
		}
	});
});