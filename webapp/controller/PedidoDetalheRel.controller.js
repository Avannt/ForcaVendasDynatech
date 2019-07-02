sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(BaseController, Controller, MessageBox) {
	"use strict";

	return BaseController.extend("testeui5.controller.PedidoDetalheRel", {

		onInit: function() {

			//FORÇA FAZER O INIT DA PÁGINA .. MESMO QUE JÁ FOI INICIADA.
			this.getRouter().getRoute("PedidoDetalheRel").attachPatternMatched(this._onLoadFields, this);
		},
		
		_onLoadFields: function(){
			var that = this;
			this.byId("idTopLevelIconTabBar").setSelectedKey("tab2");
			
			var sNroPed = this.getOwnerComponent().getModel("modelAux").getProperty("/NrPedCli");
			
			var open = indexedDB.open("Dyna_DataBase");
			
			open.onerror = function() {
				MessageBox.show(open.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};

			open.onsuccess = function() {
				var db = open.result;
				
				var store = db.transaction("AcompPedidoTopo").objectStore("AcompPedidoTopo");
				var request = store.getAll(sNroPed);
	
				request.onsuccess = function(event) {
					var oPedido = event.target.result[0];
					var oModelPed = new sap.ui.model.json.JSONModel(oPedido);
					that.getView().setModel(oModelPed, "PedidosAprovarDetalhe");
					
					store = db.transaction("AcompPedidoDetalhe").objectStore("AcompPedidoDetalhe");
					var iNroPedCli = store.index("nrPedCli");
					request = iNroPedCli.getAll(sNroPed);
		
					request.onsuccess = function(event2) {
						var oPedidoDet = event2.target.result;
						var oModelPedDet = new sap.ui.model.json.JSONModel(oPedidoDet);
						that.getView().setModel(oModelPedDet, "PedidosAprovarItens");
					};
				};
				
				// var oModel = that.getOwnerComponent().getModel("modelAux").getProperty("/DBModel");
				
				// that.getView().setModel(oModelAprovacoes, "PedidosAprovarDetalhe");
				
				// var oModelItensAprovacoes = new sap.ui.model.json.JSONModel(retornoitens.results);
				// that.getView().setModel(oModelItensAprovacoes, "PedidosAprovarItens");
			};
		},
		
		onNavBack: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("relatorioPedidos");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf testeui5.view.PedidoDetalheAprov
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf testeui5.view.PedidoDetalheAprov
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf testeui5.view.PedidoDetalheAprov
		 */
		//	onExit: function() {
		//
		//	}

	});

});