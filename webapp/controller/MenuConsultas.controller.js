sap.ui.define([
	"testeui5/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("testeui5.controller.MenuConsultas", {
		
		onInit: function () {
			this.getRouter().getRoute("menu").attachPatternMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function() {
			// var empresa = this.getOwnerComponent().getModel("modelAux").getProperty("/IdBase");
			// var nomeEmpresa;
			// var icone;
			
			// if(empresa == 1){
			// 	nomeEmpresa = "Pred -Só Fruta -Lafer";
			// 	icone = "img/predilecta.png";
			// }
			// else if(empresa == 2){
			// 	nomeEmpresa = "Stella";
			// 	icone = "img/SD.png";
			// }
			// else if(empresa == 3){
			// 	nomeEmpresa = "Minas";
			// 	icone = "img/soFrutas.png";
			// }
			// this.getOwnerComponent().getModel("modelAux").setProperty("/nomeEmpresa", nomeEmpresa);
			// this.getOwnerComponent().getModel("modelAux").setProperty("/iconeEmpresa", icone);
			// this.getOwnerComponent().getModel("helper").setProperty("/showShellHeader", true);
		},
	
		onNavBack: function(){
			sap.ui.core.UIComponent.getRouterFor(this).navTo("menu");
		},
		
		// onNavBack: function() {
		// 	console.log("onNavBack");
		// 	this.onNavBack();
		// },
		
		onAfterRendering: function() {
			//tive que colocar porque tem um bug no tile container que mostra uma tile 
			//só se deixar o showHeader da page=true na view
			// this.byId("page").setShowHeader(true);
		},
		
		onTileConsultas: function(oEvent){
				// console.log(oEvent.getSource().data("opcao"));
			switch(oEvent.getSource().data("opcao")){
			
				case "clienteConsultas":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("clienteConsultas");
					break;
				case "produtoConsultas":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("produtoConsultas");
					break;
				case "relatorioPedidos":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("relatorioPedidos");
					break;
				case "relatorioTitulos":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("relatorioTitulos");
					break;
				case "relatorioEnvSaldo":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("relatorioEntregaFutura");
					break;
				case "verbaConsultas":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("VerbaConsultas");
					break;
			}
		}
	});
});