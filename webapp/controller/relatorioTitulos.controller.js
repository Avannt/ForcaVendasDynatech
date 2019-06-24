sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/m/MessageBox",
	"testeui5/model/formatter",
	"sap/ui/core/mvc/Controller",
	"sap/m/TablePersoController",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/model/json/JSONModel"

], function(BaseController, MessageBox, Controller) {
	"use strict";
	var oDuplicataRelatorio = [];

	return BaseController.extend("testeui5.controller.relatorioTitulos", {

		onInit: function() {

			//FORÇA FAZER O INIT DA PÁGINA .. MESMO QUE JÁ FOI INICIADA.
			this.getRouter().getRoute("relatorioTitulos").attachPatternMatched(this._onLoadFields, this);
		},
		
		onItemChange2: function(oEvent){
			
			var de = oEvent.getParameters().from;
			var ate = oEvent.getParameters().to;
			
			var aFilters = [];
			var oFilter = [
				new sap.ui.model.Filter("zfbdt", sap.ui.model.FilterOperator.BT, de, ate)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("idtableTitulos").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
			
		},
		
		onItemChange: function(oEvent){
			
			var sValue = this.byId("idClientesRelatorio").getValue();
			var aFilters = [];
			var oFilter = [
				new sap.ui.model.Filter("kunnr", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("name1", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("idtableTitulos").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

		},
		
		_onLoadFields: function() {

			var that = this;
			var oClientes = [];
			var oTitulos = [];
			var oClientesGrid = [];
			oDuplicataRelatorio = [];

			this.byId("idtableTitulos").setBusy(true);

			var open1 = indexedDB.open("VB_DataBase");

			open1.onerror = function() {
				MessageBox.show(open1.error.mensage, {
					icon: MessageBox.Icon.ERROR,
					title: "Banco não encontrado!",
					actions: [MessageBox.Action.OK]
				});
			};
			
			open1.onsuccess = function() {
				var db = open1.result;

				//CARREGA OS CAMPOS DO LOCAL DE ENTREGA
				var sTitulos = db.transaction("TitulosAbertos").objectStore("TitulosAbertos");

				sTitulos.getAll().onsuccess = function(event) {
					oTitulos = event.target.result;
					
					var store = db.transaction("Clientes").objectStore("Clientes");
					store.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							
							oClientes.push(cursor.value);
							
							cursor.continue();
						} else {
							var data = new Date();
							for (var a = 0; a < oTitulos.length; a++) {
								for (var b = 0; b < oClientes.length; b++) {
									
									if (oTitulos[a].kunnr == oClientes[b].kunnr) {
										oTitulos[a].NomeCliente = oClientes[b].NomeAbrev;
										
										if (oTitulos[a].zfbdt < data){
											oTitulos[a].status = "Vencido";
											oTitulos[a].pathImg = sap.ui.require.toUrl("testeui5/img/R.png");
										} else{
											oTitulos[a].status = "Aberto";
											oTitulos[a].pathImg = sap.ui.require.toUrl("testeui5/img/S.png");
										}
									}
								}
							}
							
							var oModel = new sap.ui.model.json.JSONModel(oTitulos);
							that.getView().setModel(oModel, "TitulosAbertos");
							
							that.byId("idtableTitulos").setBusy(false);
							var cliente = that.getOwnerComponent().getModel("modelAux").getProperty("/Kunnr");
							
							if(cliente != ""){
								that.byId("idClientesRelatorio").setValue(cliente);
								that.onItemChange();
							}
						}
					};
				};
			};
		}
	});
});