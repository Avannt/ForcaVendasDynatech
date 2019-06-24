sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History"
], function(BaseController, History, ShellHeadUserItem) {
	"use strict";

	return BaseController.extend("testeui5.controller.MenuRelatorios", {

		onInit: function() {
			// set explored app's demo model on this sample
			this.getRouter().getRoute("menuRelatorios").attachPatternMatched(this._onRouteMatched, this);
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
			this.getOwnerComponent().getModel("helper").setProperty("/showShellHeader", true);
		},
		
		onTileRelatorios: function(oEvent){
			
		switch (oEvent.getSource().data("opcao")) {
				case "relatorioPedidos":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("relatorioPedidos");
					break;
				case "relatorioTitulos":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("relatorioTitulos");
					break;
				case "relatorioTabelas":
					sap.ui.core.UIComponent.getRouterFor(this).navTo("relatorioTabelas");
					break;
			}
		}
	});
});