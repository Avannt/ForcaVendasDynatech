/*eslint-disable no-console, no-alert */
sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History"
], function(BaseController, History, ShellHeadUserItem) {
	"use strict";
	var vetorCliente = [];

	return BaseController.extend("testeui5.controller.clienteConsultas", {

		onInit: function() {
			// set explored app's demo model on this sample
			this.getRouter().getRoute("clienteConsultas").attachPatternMatched(this._onCreateModel, this);
		},

		_onCreateModel: function() {

			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel);
			this.getOwnerComponent().setModel(oModel, "modelCliente");
			
			var oItem = [];
			var that = this;
			this.byId("searchField").setValue("");
			var open = indexedDB.open("Dyna_DataBase");
			
			open.onerror = function() {
				console.log(open.error.mensage);
			};

			open.onsuccess = function() {
				var db = open.result;
				
				var transaction = db.transaction("Clientes", "readonly");
				var objectStore = transaction.objectStore("Clientes");

				if ("getAll" in objectStore) {
					objectStore.getAll().onsuccess = function(event) {
						vetorCliente = event.target.result;

						var oModel = new sap.ui.model.json.JSONModel(vetorCliente);

						that.getView().setModel(oModel, "clientesCadastrados");
					};
				}
			};
		},

		onNavBack: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("menuConsultas");
		},

		onSearch: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			var aFilters = [];
			var oFilter = [new sap.ui.model.Filter("kunnr", sap.ui.model.FilterOperator.StartsWith, sValue),
				new sap.ui.model.Filter("name1", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("stras", sap.ui.model.FilterOperator.StartsWith, sValue),
				new sap.ui.model.Filter("ort01", sap.ui.model.FilterOperator.StartsWith, sValue),
				new sap.ui.model.Filter("regio", sap.ui.model.FilterOperator.StartsWith, sValue),
				new sap.ui.model.Filter("stcd1", sap.ui.model.FilterOperator.StartsWith, sValue)
			];

			var allFilters = new sap.ui.model.Filter(oFilter, false);
			aFilters.push(allFilters);
			this.byId("table_clientes").getBinding("items").filter(aFilters, "Application");
		},

		onSelectionChange: function(oEvent) {
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();

			this.getOwnerComponent().getModel("modelCliente").setProperty("/codigoCliente", oItem.getBindingContext("clientesCadastrados").getProperty("kunnr"));
				
			sap.ui.core.UIComponent.getRouterFor(this).navTo("clienteConsultasDetalhe");
		}
	});
});