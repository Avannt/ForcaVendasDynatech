sap.ui.define([
	"testeui5/controller/BaseController",
	"sap/ui/core/routing/History"

], function (BaseController,History) {
	"use strict";
	return BaseController.extend("testeui5.controller.NotFound", {
		onInit: function () {
		},
		onNavBack: function(){
			//sap.ui.core.UIComponent.getRouterFor(this).navTo("menu");
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("clienteConsultas", {}, true);
			}
		}
	});
});